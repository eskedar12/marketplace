const asyncHandler = require('../../utils/asyncHandler');
const reportsService = require('./reports.service');

const create = asyncHandler(async (req, res) => {
  const report = await reportsService.fileReport(req.user.id, req.body);
  res.status(201).json({ success: true, data: report });
});

const getAll = asyncHandler(async (req, res) => {
  const reports = await reportsService.listReports(req.query.status);
  res.json({ success: true, data: reports });
});

const updateStatus = asyncHandler(async (req, res) => {
  const report = await reportsService.reviewReport(req.params.id, req.body.status);
  res.json({ success: true, data: report });
});

module.exports = { create, getAll, updateStatus };
