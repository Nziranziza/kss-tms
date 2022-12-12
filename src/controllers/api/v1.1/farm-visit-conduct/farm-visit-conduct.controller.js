const BaseController = require('core/library/BaseController');
const {
    farmVisitConductRepository
} = require('database/farm-visit-conduct/farm-visit-conduct.repository');
const asyncWrapper = require("core/helpers/asyncWrapper");
const responseWrapper = require("core/helpers/responseWrapper");
const {statusCodes} = require("utils/constants/common");
const excelJS = require("exceljs");
const appRoot = require("app-root-path");
const fs = require("fs");
const CustomError = require("core/helpers/customerError");
const ejs = require("ejs");
const _path = require("path");
const pdf = require("html-pdf");

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
            const path = `${appRoot}/downloads`;
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
                    created_at: visit.createdAt,
                    upi: visit.farm.upiNumber,
                    surname: visit.owner.firstName,
                    foreName: visit.owner.lastName,
                    location: visit.farm.location.prov_id.namek +
                        ' > ' + visit.farm.location.dist_id.name +
                        ' > ' + visit.farm.location.sect_id.name +
                        ' > ' + visit.farm.location.cell_id.name +
                        ' > ' + visit.farm.location.village_id.name,
                    visitor: visit.visitor.lastName + ' ' + visit.visitor.firstName,
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
            }  else if (type === 'pdf') {
            ejs.renderFile(
                _path.join(__dirname, '/../../../../views/', 'farm_visits_report.ejs'),
                {visits:visits },
                (err, data) => {
                    if (err) {
                        console.log(err);
                        return err;
                    } else {
                        let options = {
                            height: '11.25in',
                            width: '10in',
                            header: {
                                height: '20mm'
                            },
                            footer: {
                                height: '20mm'
                            }
                        };
                        const fileName = `${path}/${Date.now()}-schedules_report.pdf`;
                        pdf.create(data, options).toFile(fileName, function (err, data) {
                            if (err) {
                                console.log(err)
                                return err;
                            } else {
                                const str = fs.readFileSync(fileName, {encoding: "base64"});
                                console.log(str);
                                return responseWrapper({
                                    res,
                                    status: statusCodes.OK,
                                    message: "Success",
                                    data: {
                                        file: str,
                                        type: "pdf",
                                    },
                                });
                            }
                        });
                    }
                }
            );

        } else {
                throw new CustomError("File type not found", statusCodes.NOT_FOUND);
            }
        });
    }
}
module.exports.farmVisitConductCtrl = new FarmVisitConductController(farmVisitConductRepository);
