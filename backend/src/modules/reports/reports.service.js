const ApiError = require('../../utils/ApiError');
const reportsRepository = require('./reports.repository');

async function fileReport(reporterId, { listing_id, reason }) {
  return reportsRepository.create({ reporter_id: reporterId, listing_id, reason });
}

async function listReports(status) {
  return reportsRepository.findAll(status);
}

async function reviewReport(id, status) {
  const validStatuses = ['pending', 'reviewed', 'dismissed'];
  if (!validStatuses.includes(status)) {
    throw ApiError.badRequest(`status must be one of: ${validStatuses.join(', ')}`);
  }
  const report = await reportsRepository.updateStatus(id, status);
  if (!report) throw ApiError.notFound('Report not found');
  return report;
}

module.exports = { fileReport, listReports, reviewReport };
