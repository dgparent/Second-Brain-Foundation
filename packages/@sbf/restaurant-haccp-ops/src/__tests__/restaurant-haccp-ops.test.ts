import {
  createFoodItem,
  createTemperatureLog,
  createCriticalControlPoint,
  createIncidentReport,
  createCleaningTask,
  getExpiringItems,
  getFailedTemperatureLogs,
  getCriticalIncidents,
  calculateTemperatureComplianceRate,
  calculateWasteCost,
  getExpiringCertifications,
} from '../index';

describe('@sbf/restaurant-haccp-ops', () => {
  describe('Entity Creation', () => {
    it('should create a food item', () => {
      const foodItem = createFoodItem({
        name: "Chicken Breast",
        category: "protein",
        supplierUid: "supplier-001",
        expiryDate: "2025-03-15",
        allergens: [],
      });

      expect(foodItem.type).toBe('restaurant.food_item');
      expect(foodItem.metadata.name).toBe("Chicken Breast");
      expect(foodItem.metadata.category).toBe("protein");
    });

    it('should create a temperature log with pass/fail', () => {
      const passLog = createTemperatureLog({
        storageUid: "storage-001",
        valueC: 2.5,
        criticalLimitC: 4.0,
      });

      expect(passLog.type).toBe('restaurant.temperature_log');
      expect(passLog.metadata.pass_fail).toBe('pass');

      const failLog = createTemperatureLog({
        storageUid: "storage-001",
        valueC: 6.0,
        criticalLimitC: 4.0,
      });

      expect(failLog.metadata.pass_fail).toBe('fail');
    });

    it('should create a critical control point', () => {
      const ccp = createCriticalControlPoint({
        haccpPlanUid: "haccp-2025",
        step: "Cooking Chicken",
        hazardType: "biological",
        criticalLimitTempC: 74,
        monitoringFreqMin: 60,
        responsibleRole: "Kitchen Lead",
      });

      expect(ccp.type).toBe('restaurant.ccp');
      expect(ccp.metadata.hazard_type).toBe("biological");
      expect(ccp.metadata.critical_limit_temp_c).toBe(74);
    });

    it('should create an incident report', () => {
      const incident = createIncidentReport({
        incidentType: "contamination_event",
        severity: "high",
        description: "Possible cross-contamination",
        actionTaken: "Discarded affected batch",
      });

      expect(incident.type).toBe('restaurant.incident');
      expect(incident.metadata.severity).toBe('high');
      expect(incident.metadata.incident_type).toBe('contamination_event');
    });

    it('should create a cleaning task', () => {
      const task = createCleaningTask({
        area: "Prep Table 1",
        freq: "hourly",
        assignedTo: "staff-001",
      });

      expect(task.type).toBe('restaurant.cleaning_task');
      expect(task.metadata.status).toBe('pending');
      expect(task.metadata.freq).toBe('hourly');
    });
  });

  describe('Query Functions', () => {
    it('should identify expiring items', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextMonth = new Date(today);
      nextMonth.setDate(nextMonth.getDate() + 30);

      const foodItems = [
        createFoodItem({
          name: "Milk",
          category: "dairy",
          supplierUid: "supplier-001",
          expiryDate: tomorrow.toISOString().split('T')[0],
        }),
        createFoodItem({
          name: "Cheese",
          category: "dairy",
          supplierUid: "supplier-001",
          expiryDate: nextMonth.toISOString().split('T')[0],
        }),
      ];

      const expiring = getExpiringItems(foodItems, 7);
      expect(expiring).toHaveLength(1);
      expect(expiring[0].metadata.name).toBe("Milk");
    });

    it('should filter failed temperature logs', () => {
      const logs = [
        createTemperatureLog({
          storageUid: "storage-001",
          valueC: 2.5,
          criticalLimitC: 4.0,
        }),
        createTemperatureLog({
          storageUid: "storage-001",
          valueC: 6.0,
          criticalLimitC: 4.0,
        }),
      ];

      const failed = getFailedTemperatureLogs(logs);
      expect(failed).toHaveLength(1);
      expect(failed[0].metadata.value_c).toBe(6.0);
    });

    it('should calculate temperature compliance rate', () => {
      const logs = [
        createTemperatureLog({ storageUid: "storage-001", valueC: 2.0, criticalLimitC: 4.0 }),
        createTemperatureLog({ storageUid: "storage-001", valueC: 3.0, criticalLimitC: 4.0 }),
        createTemperatureLog({ storageUid: "storage-001", valueC: 5.0, criticalLimitC: 4.0 }),
        createTemperatureLog({ storageUid: "storage-001", valueC: 2.5, criticalLimitC: 4.0 }),
      ];

      const rate = calculateTemperatureComplianceRate(logs);
      expect(rate).toBe(75); // 3 out of 4 passed
    });

    it('should identify critical incidents', () => {
      const incidents = [
        createIncidentReport({
          incidentType: "contamination_event",
          severity: "low",
          description: "Minor spill",
        }),
        createIncidentReport({
          incidentType: "foodborne_illness",
          severity: "critical",
          description: "Customer illness reported",
        }),
      ];

      const critical = getCriticalIncidents(incidents);
      expect(critical).toHaveLength(1);
      expect(critical[0].metadata.severity).toBe('critical');
    });
  });
});
