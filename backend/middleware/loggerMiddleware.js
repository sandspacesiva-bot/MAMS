const AuditLog = require('../models/AuditLog');

exports.auditLog = (action, entity) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (data) => {
    if (res.statusCode < 400) {
      try {
        await AuditLog.create({
          userId:    req.user?._id,
          action,
          entity,
          entityId:  data?._id || data?.data?._id,
          details:   { body: req.body, params: req.params },
          ipAddress: req.ip,
        });
      } catch (e) { console.error('Audit log failed:', e.message); }
    }
    return originalJson(data);
  };
  next();
};
