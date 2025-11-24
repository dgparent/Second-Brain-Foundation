import {
  createProperty,
  createUnit,
  createLease,
  createRentInvoice,
  createMaintenanceRequest,
  createWorkOrder,
  getVacantUnits,
  getOccupiedUnits,
  calculateOccupancyRate,
  getUnpaidInvoices,
  getExpiringLeases,
  calculateMonthlyRevenue,
} from '../index';

describe('@sbf/property-ops', () => {
  describe('Entity Creation', () => {
    it('should create a property', () => {
      const property = createProperty({
        title: "Riverside Apartments",
        address: "123 River St",
        propertyType: "residential_multi_unit",
        ownerUid: "owner-001",
      });

      expect(property.type).toBe('property.property');
      expect(property.metadata.title).toBe("Riverside Apartments");
      expect(property.metadata.property_type).toBe("residential_multi_unit");
    });

    it('should create a unit', () => {
      const unit = createUnit({
        buildingUid: "bldg-001",
        unitNumber: "203",
        bedrooms: 2,
        bathrooms: 1,
        squareFeet: 890,
        rentAmount: 1850,
      });

      expect(unit.type).toBe('property.unit');
      expect(unit.metadata.unit_number).toBe("203");
      expect(unit.metadata.status).toBe('vacant');
    });

    it('should create a lease', () => {
      const lease = createLease({
        unitUid: "unit-001",
        tenantUid: "tenant-001",
        startDate: "2025-03-01",
        endDate: "2026-02-28",
        rentAmount: 1850,
        depositAmount: 1850,
      });

      expect(lease.type).toBe('property.lease');
      expect(lease.metadata.deposit_status).toBe('held');
      expect(lease.metadata.payment_due_day).toBe(1);
    });

    it('should create a rent invoice', () => {
      const invoice = createRentInvoice({
        unitUid: "unit-001",
        tenantUid: "tenant-001",
        period: "2025-03",
        amountDue: 1850,
      });

      expect(invoice.type).toBe('property.rent_invoice');
      expect(invoice.metadata.status).toBe('unpaid');
      expect(invoice.metadata.amount_due).toBe(1850);
    });

    it('should create a maintenance request', () => {
      const request = createMaintenanceRequest({
        unitUid: "unit-001",
        reportedBy: "tenant-001",
        issueType: "plumbing",
        priority: "high",
        description: "Leaking pipe under sink",
      });

      expect(request.type).toBe('property.maintenance_request');
      expect(request.metadata.status).toBe('new');
      expect(request.metadata.priority).toBe('high');
    });

    it('should create a work order', () => {
      const workOrder = createWorkOrder({
        requestUid: "mr-001",
        unitUid: "unit-001",
        vendorUid: "vendor-plumbco",
        description: "Fix leaking pipe",
        costEstimate: 150,
      });

      expect(workOrder.type).toBe('property.work_order');
      expect(workOrder.metadata.status).toBe('draft');
      expect(workOrder.metadata.cost_estimate).toBe(150);
    });
  });

  describe('Query Functions', () => {
    it('should filter vacant units', () => {
      const units = [
        createUnit({
          buildingUid: "bldg-001",
          unitNumber: "101",
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 650,
        }),
        { ...createUnit({
          buildingUid: "bldg-001",
          unitNumber: "102",
          bedrooms: 2,
          bathrooms: 1,
          squareFeet: 850,
        }), metadata: { ...createUnit({
          buildingUid: "bldg-001",
          unitNumber: "102",
          bedrooms: 2,
          bathrooms: 1,
          squareFeet: 850,
        }).metadata, status: 'occupied' as const } },
      ];

      const vacant = getVacantUnits(units);
      expect(vacant).toHaveLength(1);
      expect(vacant[0].metadata.unit_number).toBe("101");
    });

    it('should calculate occupancy rate', () => {
      const units = [
        { ...createUnit({
          buildingUid: "bldg-001",
          unitNumber: "101",
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 650,
        }), metadata: { ...createUnit({
          buildingUid: "bldg-001",
          unitNumber: "101",
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 650,
        }).metadata, status: 'occupied' as const } },
        { ...createUnit({
          buildingUid: "bldg-001",
          unitNumber: "102",
          bedrooms: 2,
          bathrooms: 1,
          squareFeet: 850,
        }), metadata: { ...createUnit({
          buildingUid: "bldg-001",
          unitNumber: "102",
          bedrooms: 2,
          bathrooms: 1,
          squareFeet: 850,
        }).metadata, status: 'occupied' as const } },
        createUnit({
          buildingUid: "bldg-001",
          unitNumber: "103",
          bedrooms: 2,
          bathrooms: 1,
          squareFeet: 850,
        }),
      ];

      const rate = calculateOccupancyRate(units);
      expect(rate).toBeCloseTo(66.67, 1);
    });

    it('should calculate monthly revenue', () => {
      const invoices = [
        createRentInvoice({
          unitUid: "unit-001",
          tenantUid: "tenant-001",
          period: "2025-03",
          amountDue: 1850,
        }),
        createRentInvoice({
          unitUid: "unit-002",
          tenantUid: "tenant-002",
          period: "2025-03",
          amountDue: 2100,
        }),
        createRentInvoice({
          unitUid: "unit-003",
          tenantUid: "tenant-003",
          period: "2025-04",
          amountDue: 1950,
        }),
      ];

      const revenue = calculateMonthlyRevenue(invoices, "2025-03");
      expect(revenue).toBe(3950);
    });
  });
});
