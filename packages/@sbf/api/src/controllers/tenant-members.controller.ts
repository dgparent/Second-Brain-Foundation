// Tenant Members Controller
// REST API for membership and invitation management

import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  InviteMemberDto,
  TenantMembership,
  TenantRole
} from '@sbf/shared/types/tenant.types';

import { AuthGuard } from '../guards/auth.guard';
import { TenantContextGuard } from '../guards/tenant-context.guard';
import { User } from '../decorators/user.decorator';
import { TenantCtx } from '../decorators/tenant-context.decorator';

import { TenantService } from '../services/tenant.service';
import { EmailService } from '../services/email.service';

@ApiTags('tenant-members')
@Controller('api/v1/tenants/:tenantId/members')
@UseGuards(AuthGuard, TenantContextGuard)
export class TenantMembersController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly emailService: EmailService
  ) {}

  /**
   * List tenant members
   * GET /api/v1/tenants/:tenantId/members
   */
  @Get()
  @ApiOperation({ summary: 'List all members of a tenant' })
  @ApiResponse({ status: 200, description: 'Members retrieved successfully' })
  async listMembers(
    @Param('tenantId') tenantId: string,
    @TenantCtx() ctx: any,
    @Query('status') status?: string,
    @Query('role') role?: string
  ): Promise<{ members: any[]; total: number }> {
    const members = await this.tenantService.getMembers(tenantId, {
      status,
      role
    });

    return {
      members: members.map(m => ({
        user_id: m.user_id,
        email: m.user?.email,
        name: m.user?.name,
        role: m.role,
        status: m.status,
        joined_at: m.joined_at,
        invited_at: m.invited_at,
        invited_by: m.invited_by
      })),
      total: members.length
    };
  }

  /**
   * Invite member to tenant
   * POST /api/v1/tenants/:tenantId/members/invite
   */
  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Invite a user to join the tenant' })
  @ApiResponse({ status: 201, description: 'Invitation sent successfully' })
  @ApiResponse({ status: 403, description: 'Requires admin role' })
  @ApiResponse({ status: 409, description: 'User already a member' })
  async inviteMember(
    @Param('tenantId') tenantId: string,
    @Body() dto: InviteMemberDto,
    @TenantCtx() ctx: any
  ): Promise<{ invitation: TenantMembership; message: string }> {
    // Require admin role
    if (!ctx.isAdmin()) {
      throw new Error('Only tenant admins can invite members');
    }

    // Validate role
    this.validateRole(dto.role, ctx.tenant_type);

    // Check if user already exists and is already a member
    const existingMember = await this.tenantService.findMemberByEmail(
      tenantId,
      dto.email
    );

    if (existingMember && existingMember.status === 'active') {
      throw new Error('User is already an active member');
    }

    // Create or update invitation
    const invitation = await this.tenantService.createInvitation({
      tenant_id: tenantId,
      email: dto.email,
      role: dto.role,
      invited_by: ctx.user_id,
      status: 'invited',
      metadata: dto.metadata
    });

    // Send invitation email
    const tenant = await this.tenantService.findById(tenantId);
    await this.emailService.sendInvitation({
      to: dto.email,
      tenant_name: tenant.display_name,
      role: dto.role,
      inviter_name: ctx.attributes.user_name || 'A team member',
      invite_link: `${process.env.APP_URL}/accept-invite/${invitation.id}`,
      expires_in_days: 7
    });

    return {
      invitation,
      message: `Invitation sent to ${dto.email}`
    };
  }

  /**
   * Accept invitation
   * POST /api/v1/invitations/:inviteId/accept
   * Note: This endpoint is outside tenant context (user not yet a member)
   */
  @Post('/invitations/:inviteId/accept')
  @UseGuards(AuthGuard) // Only auth guard, not tenant guard
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an invitation to join a tenant' })
  @ApiResponse({ status: 200, description: 'Invitation accepted' })
  @ApiResponse({ status: 404, description: 'Invitation not found or expired' })
  async acceptInvitation(
    @Param('inviteId') inviteId: string,
    @User() user: any
  ): Promise<{ membership: TenantMembership; message: string }> {
    const membership = await this.tenantService.acceptInvitation(
      inviteId,
      user.id
    );

    return {
      membership,
      message: 'Successfully joined tenant'
    };
  }

  /**
   * Decline invitation
   * POST /api/v1/invitations/:inviteId/decline
   */
  @Post('/invitations/:inviteId/decline')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decline an invitation' })
  async declineInvitation(
    @Param('inviteId') inviteId: string,
    @User() user: any
  ): Promise<{ message: string }> {
    await this.tenantService.declineInvitation(inviteId, user.id);

    return {
      message: 'Invitation declined'
    };
  }

  /**
   * Get member details
   * GET /api/v1/tenants/:tenantId/members/:userId
   */
  @Get(':userId')
  @ApiOperation({ summary: 'Get member details' })
  async getMember(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @TenantCtx() ctx: any
  ): Promise<{ member: any }> {
    const membership = await this.tenantService.getMembership(tenantId, userId);

    return {
      member: {
        ...membership,
        user: membership.user
      }
    };
  }

  /**
   * Update member role
   * PATCH /api/v1/tenants/:tenantId/members/:userId
   */
  @Patch(':userId')
  @ApiOperation({ summary: 'Update member role' })
  @ApiResponse({ status: 200, description: 'Member role updated' })
  @ApiResponse({ status: 403, description: 'Requires admin role' })
  async updateMember(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @Body() dto: { role: TenantRole; metadata?: any },
    @TenantCtx() ctx: any
  ): Promise<{ membership: TenantMembership; message: string }> {
    // Require admin role
    if (!ctx.isAdmin()) {
      throw new Error('Only tenant admins can update member roles');
    }

    // Cannot demote yourself if you're the last owner
    if (userId === ctx.user_id) {
      const isLastOwner = await this.tenantService.isLastOwner(tenantId, userId);
      if (isLastOwner && dto.role !== 'tenant_owner') {
        throw new Error('Cannot demote yourself as the last owner');
      }
    }

    // Validate role for tenant type
    this.validateRole(dto.role, ctx.tenant_type);

    const membership = await this.tenantService.updateMembership(
      tenantId,
      userId,
      {
        role: dto.role,
        metadata: dto.metadata
      }
    );

    return {
      membership,
      message: 'Member role updated successfully'
    };
  }

  /**
   * Remove member from tenant
   * DELETE /api/v1/tenants/:tenantId/members/:userId
   */
  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove member from tenant' })
  @ApiResponse({ status: 204, description: 'Member removed successfully' })
  @ApiResponse({ status: 403, description: 'Requires admin role or self-removal' })
  async removeMember(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @TenantCtx() ctx: any
  ): Promise<void> {
    // Require admin role or self-removal
    if (!ctx.isAdmin() && ctx.user_id !== userId) {
      throw new Error('Only admins can remove other members');
    }

    // Cannot remove last owner
    const isLastOwner = await this.tenantService.isLastOwner(tenantId, userId);
    if (isLastOwner) {
      throw new Error('Cannot remove the last owner. Transfer ownership first or delete the tenant.');
    }

    await this.tenantService.removeMembership(tenantId, userId);
  }

  /**
   * Transfer ownership
   * POST /api/v1/tenants/:tenantId/members/:userId/transfer-ownership
   */
  @Post(':userId/transfer-ownership')
  @ApiOperation({ summary: 'Transfer tenant ownership' })
  @ApiResponse({ status: 200, description: 'Ownership transferred' })
  @ApiResponse({ status: 403, description: 'Only current owner can transfer' })
  async transferOwnership(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @TenantCtx() ctx: any
  ): Promise<{ message: string }> {
    // Only current owner can transfer
    if (!ctx.isOwner()) {
      throw new Error('Only the current owner can transfer ownership');
    }

    // Verify target user is an active member
    const targetMember = await this.tenantService.getMembership(tenantId, userId);
    if (!targetMember || targetMember.status !== 'active') {
      throw new Error('Target user must be an active member');
    }

    // Transfer ownership
    await this.tenantService.transferOwnership(
      tenantId,
      ctx.user_id,
      userId
    );

    return {
      message: 'Ownership transferred successfully'
    };
  }

  /**
   * Suspend member
   * POST /api/v1/tenants/:tenantId/members/:userId/suspend
   */
  @Post(':userId/suspend')
  @ApiOperation({ summary: 'Suspend a member' })
  @ApiResponse({ status: 200, description: 'Member suspended' })
  @ApiResponse({ status: 403, description: 'Requires admin role' })
  async suspendMember(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @TenantCtx() ctx: any,
    @Body() dto: { reason?: string }
  ): Promise<{ message: string }> {
    if (!ctx.isAdmin()) {
      throw new Error('Only admins can suspend members');
    }

    // Cannot suspend owner
    const targetMember = await this.tenantService.getMembership(tenantId, userId);
    if (targetMember.role === 'tenant_owner') {
      throw new Error('Cannot suspend tenant owner');
    }

    await this.tenantService.updateMembership(tenantId, userId, {
      status: 'suspended',
      metadata: {
        ...targetMember.metadata,
        suspended_at: new Date(),
        suspended_by: ctx.user_id,
        suspend_reason: dto.reason
      }
    });

    return {
      message: 'Member suspended successfully'
    };
  }

  /**
   * Reactivate suspended member
   * POST /api/v1/tenants/:tenantId/members/:userId/reactivate
   */
  @Post(':userId/reactivate')
  @ApiOperation({ summary: 'Reactivate a suspended member' })
  async reactivateMember(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @TenantCtx() ctx: any
  ): Promise<{ message: string }> {
    if (!ctx.isAdmin()) {
      throw new Error('Only admins can reactivate members');
    }

    await this.tenantService.updateMembership(tenantId, userId, {
      status: 'active'
    });

    return {
      message: 'Member reactivated successfully'
    };
  }

  // ===== HELPER METHODS =====

  /**
   * Validate role is appropriate for tenant type
   */
  private validateRole(role: TenantRole, tenantType: string): void {
    const validRoles = {
      personal: ['tenant_owner'],
      pseudo_personal: ['tenant_owner', 'guardian', 'subject', 'care_team'],
      professional: [
        'tenant_owner',
        'tenant_admin',
        'org_admin',
        'billing_admin',
        'manager',
        'member',
        'viewer',
        'guest'
      ]
    };

    if (!validRoles[tenantType]?.includes(role)) {
      throw new Error(
        `Role ${role} is not valid for ${tenantType} tenant type`
      );
    }
  }
}
