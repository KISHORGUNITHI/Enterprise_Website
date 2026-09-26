import { AdminOrderService } from '../services/AdminOrderService.js';

export class AdminOrderController {
  constructor() {
    this.service = new AdminOrderService();
  }

  list = async (req, res) => {
    try {
      const filters = {
        status: req.query.status,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await this.service.list(filters);
      return res.json(result);
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        message: err.message
      });
    }
  };

  getDetail = async (req, res) => {
    try {
      const { id } = req.params;

      const result = await this.service.getDetail(id);
      return res.json(result);
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        message: err.message
      });
    }
  };

  updateStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, cancelReason } = req.body;

      const result = await this.service.updateStatus(id, status, { cancelReason });
      return res.json(result);
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({
        success: false,
        message: err.message
      });
    }
  };
}

export default new AdminOrderController();
