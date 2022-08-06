const BaseController = require('../../../../core/library/BaseController');
const {
    farmVisitConductRepository
} = require('../../../../database/farm-visit-conduct/farm-visit-conduct.repository');
const asyncWrapper = require("../../../../core/helpers/asyncWrapper");
const responseWrapper = require("../../../../core/helpers/responseWrapper");
const {statusCodes} = require("../../../../utils/constants/common");
const excelJS = require("exceljs");
const appRoot = require("app-root-path");
const fs = require("fs");
const CustomError = require("../../../../core/helpers/customerError");

class FarmVisitConductController extends BaseController {
    constructor(repository) {
        super(repository);
        this.report = this.report.bind(this);
        this.downloadReport = this.downloadReport.bind(this);
        this.statistics = this.statistics.bind(this);
    }
    statistics(req, res) {
        return asyncWrapper(res, async () => {
            const {body} = req;
            const visits = await this.repository.statistics(body);
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: "Success",
                data: visits,
            });

        });
    }

    report(req, res) {
        return asyncWrapper(res, async () => {
            const {body} = req;
            const visits = await this.repository.report(body);
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: "Success",
                data: visits,
            });
        });
    }

    downloadReport(req, res) {
        return asyncWrapper(res, async () => {
            const {body, params} = req;
            const type = params.type;
            const visits = await this.repository.report(body);
            const workbook = new excelJS.Workbook();
            const worksheet = workbook.addWorksheet("Farm-visits");
            const path = `${appRoot}/files/downloads`;
            worksheet.columns = [
                {header: "Date added", key: "created_at", width: 10},
                {header: "UPI", key: "upi", width: 10},
                {header: "Lastname", key: "surname", width: 10},
                {header: "Firstname", key: "foreName", width: 10},
                {header: "Location", key: "location", width: 10},
                {header: "Visitor", key: "visitor", width: 10},
                {header: "Gap", key: "gap", width: 10},
                {header: "Adoption", key: "adoption", width: 10}
            ];
            visits.forEach((visit) => {
                worksheet.addRow({
                    created_at: visit.created_at,
                    upi: visit.farm.upiNumber,
                    surname: visit.farm.owner.surname,
                    foreName: visit.farm.owner.foreName,
                    location: visit.farm.location.prov_id.namek +
                        ' > ' + visit.farm.location.dist_id.name +
                        ' > ' + visit.farm.location.sect_id.name +
                        ' > ' + visit.farm.location.cell_id.name,
                    visitor: visit.visitor.surname + ' ' + visit.visitor.foreName,
                    gap: visit.gap.gap_name,
                    adoption: (visit.overall_score/visit.overall_weight) * 100
                });
            });
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = {bold: true};
            });

            if (type === 'xlsx') {
                const fileName = `${path}/${Date.now()}-visits.xlsx`;
                await workbook.xlsx.writeFile(fileName)
                    .then(() => {
                        const str = fs.readFileSync(fileName, {encoding: 'base64'});
                        return responseWrapper({
                            res,
                            status: statusCodes.OK,
                            message: "Success",
                            data: {
                                file: str,
                                type: 'xlsx'
                            }
                        });
                    });
            } else if (type === 'csv') {
                const fileName = `${path}/${Date.now()}-visits.csv`;
                await workbook.csv.writeFile(fileName)
                    .then(() => {
                        const str = fs.readFileSync(fileName, {encoding: 'base64'});
                        return responseWrapper({
                            res,
                            status: statusCodes.OK,
                            message: "Success",
                            data: {
                                file: str,
                                type: 'csv'
                            }
                        });
                    });
            } else {
                throw new CustomError("File type not found", statusCodes.NOT_FOUND);
            }
        });
    }
}
module.exports.farmVisitConductCtrl = new FarmVisitConductController(farmVisitConductRepository);
