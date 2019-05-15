import { HealthCheckController } from "./health-check.controller";

describe("HealthCheckController", () => {
  let controller: HealthCheckController;

  beforeEach(() => {
    controller = new HealthCheckController();
  });

  describe("alive", () => {
    it('should return alive"', async () => {
      expect(await controller.getAlive()).toBe("alive");
    });
  });
});
