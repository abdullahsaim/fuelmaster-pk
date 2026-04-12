// Factory function for standard CRUD operations
// Used by: suppliers, customers, employees, expenses, products, fuel types, tanks, nozzles
// Tenant-aware: auto-filters by req.tenantId and auto-sets tenant on create

const createCrudController = (Model, populateFields = '') => {
  return {
    // GET all
    getAll: async (req, res) => {
      try {
        const { page = 1, limit = 100, sort = '-createdAt', search, ...filters } = req.query;
        const query = {};

        // Tenant scoping (superadmin without _tenant sees all)
        if (req.tenantId) {
          query.tenant = req.tenantId;
        }

        // Build dynamic filters
        Object.keys(filters).forEach(key => {
          if (filters[key] && key !== 'page' && key !== 'limit' && key !== 'sort' && key !== '_tenant') {
            query[key] = filters[key];
          }
        });

        // Text search on name field
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ];
        }

        const total = await Model.countDocuments(query);
        let dbQuery = Model.find(query).sort(sort).skip((page - 1) * limit).limit(parseInt(limit));
        if (populateFields) {
          populateFields.split(' ').forEach(field => { dbQuery = dbQuery.populate(field); });
        }
        const data = await dbQuery;
        res.json({ success: true, count: data.length, total, page: parseInt(page), data });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    },

    // GET one by ID
    getOne: async (req, res) => {
      try {
        const filter = { _id: req.params.id };
        if (req.tenantId) filter.tenant = req.tenantId;

        let query = Model.findOne(filter);
        if (populateFields) {
          populateFields.split(' ').forEach(field => { query = query.populate(field); });
        }
        const doc = await query;
        if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: doc });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    },

    // POST create
    create: async (req, res) => {
      try {
        // Auto-set tenant
        if (req.tenantId) {
          req.body.tenant = req.tenantId;
        }
        const doc = await Model.create(req.body);
        res.status(201).json({ success: true, data: doc });
      } catch (error) {
        if (error.code === 11000) {
          return res.status(400).json({ success: false, message: 'Duplicate entry — record already exists' });
        }
        res.status(500).json({ success: false, message: error.message });
      }
    },

    // PUT update
    update: async (req, res) => {
      try {
        const filter = { _id: req.params.id };
        if (req.tenantId) filter.tenant = req.tenantId;

        const doc = await Model.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
        if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: doc });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    },

    // DELETE
    remove: async (req, res) => {
      try {
        const filter = { _id: req.params.id };
        if (req.tenantId) filter.tenant = req.tenantId;

        const doc = await Model.findOneAndDelete(filter);
        if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, message: 'Deleted successfully' });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    },
  };
};

module.exports = createCrudController;
