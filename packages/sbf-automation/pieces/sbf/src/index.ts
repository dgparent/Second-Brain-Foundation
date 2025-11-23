import { createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { sbfAuth } from './lib/auth';
import { createTaskAction } from './lib/actions/create-task';
import { createMeetingAction } from './lib/actions/create-meeting';
import { queryEntitiesAction } from './lib/actions/query-entities';
import { newEntityTrigger } from './lib/triggers/new-entity';

export const sbf = createPiece({
  displayName: 'Second Brain Foundation',
  description: 'Create and manage entities in your SBF knowledge graph for VA automation',
  auth: sbfAuth,
  categories: [PieceCategory.PRODUCTIVITY, PieceCategory.BUSINESS_INTELLIGENCE],
  logoUrl: 'https://cdn.activepieces.com/pieces/custom.svg',
  authors: ['SBF Team'],
  minimumSupportedRelease: '0.20.0',
  actions: [
    createTaskAction,
    createMeetingAction,
    queryEntitiesAction,
  ],
  triggers: [
    newEntityTrigger,
  ],
});

export default sbf;
