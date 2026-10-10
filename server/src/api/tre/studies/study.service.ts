import { getImageUrl, uploadFile } from "../../../shared/firebase.service";
import { AppId, IUser, IUserDTO, IUserFilterParams, UserType } from "../../users/user.model";
import { createUser, getUserByUid, getUsers } from "../../users/user.service";
import Study, { IMember, IStudy, IStudyFilterParams, MemberRole, StudyStatus } from "./study.model";
import StudyResult, { IResult, IStudyResult, IStudyResultFilterParams, ResultStatus } from "./studyResult.model";
import StudyVariable, { IStudyVariable } from "./studyVariable.model";
import XLSX from "xlsx";
import fs from 'fs';
import crypto from 'crypto';
import { unlink } from "fs/promises";
import { Response } from "express";
import BadRequestError from "../../../errors/badRequestError";

export const createStudy = async (json: IStudy, uid: string | undefined) => {
    try {
        if(uid) {
            const user = await getUserByUid(uid);
            json.createdBy = user?._id;
            json.members = [{
                role: MemberRole.OWNER,
                user: user?._id
            }]
            const study = new Study(json);
            const result = await study.save();

            if(json?.variables?.length > 0) {
                const promiseArray = [];
                for(const variable of json.variables) {
                    let _variable = new StudyVariable(variable);
                    _variable.study = result._id;
                    promiseArray.push(_variable.save());
                }
                await Promise.all(promiseArray);
            }
            return result;
        }
        
    } catch (error) {
        throw error;
    }
};

export const updateStudy = async (id: string, json: IStudy) => {
    try {
        const study = await Study.findOne({ _id: id });
        if(study) {
            const updateQuery: any = {};
            if(study.name !== json.name) {
                updateQuery['name'] = json.name;
            }
            if(study.description !== json.description) {
                updateQuery['description'] = json.description;
            }
            await Study.updateOne({ _id: id }, {
                $set: updateQuery
            });
            if(json?.variables?.length > 0) {
                const promiseArray = [];
                for(const variable of json.variables) {
                    let _variable = new StudyVariable(variable);
                    _variable.study = study._id;
                    promiseArray.push(_variable.save());
                }
                await Promise.all(promiseArray);
            }
            return true;
        }
        
        return false;
    } catch (error) {
        throw error;
    }
};

export const updateStudyVariablesOrder = async (id: string, variables: IStudyVariable[]) => {
    try {
        const study = await Study.findOne({ _id: id });
        if(study && variables.length > 0) {
            const promiseArray = variables.map(variable => {
                return StudyVariable.updateOne({ _id: variable._id }, {
                    $set: {
                        order: variable.order
                    }
                });
            })
            console.log('promiseArray', promiseArray.length)
            await Promise.all(promiseArray);
            return true;
        }
        
        return false;
    } catch (error) {
        throw error;
    }
};

export const addMemberToStudy = async (id: string, member: IMember,  uid: string | undefined) => {
    try {
        if(member.user && member.role) {
            await Study.updateOne({
                _id: id
            }, {
                $push: {
                    members: member
                }
            });
        }
        else if(member.email && member.name && member.role) {
            let user: IUserDTO = {
                name: member.name,
                email: member.email,
                userType: UserType.USER,
                password: 'qazwsx@',
                appId: [AppId.TRE]
            }
            const newUser = await createUser(user);
            const newMember = {
                role: member.role,
                user: newUser._id
            }
            //console.log('newMember ', JSON.stringify(newMember))
            await Study.updateOne({
                _id: id
            }, {
                $push: {
                    members: newMember
                }
            });
        }
    } catch (error) {
        throw error;
    }
};

export const getStudies = async (params: IStudyFilterParams, uid: string) => {
    try {
        const query = await getFilterQuery(params, uid)
        const results = await Study.find(query).populate('createdBy');
        return results;
    } catch (error) {
        throw error;
    }
};

export const getStudy = async (id: string) => {
    try {
        const options = { sort: [{'order': 1 }] };
        let result = await Study.findById(id).populate({
            path: 'variables',
            options
        }).populate('createdBy');
        return result;
    } catch (error) {
        throw error;
    }
};

export const getEligbleUsers = async (id: string, keyWord: string) => {
    try {
        const study = await Study.findById(id);
        let ids = study?.members.map(x => (x.user as string));

        const params: IUserFilterParams = {
            keyWord,
            appId: 'tre',
            nids: ids
        }
        let result = await getUsers(params);
        return result;
    } catch (error) {
        throw error;
    }
};

export const createResult = async (id: string, json: IStudyResult, uid: string | undefined) => {
    try {
        if(uid) {
            const user = await getUserByUid(uid);
            json.createdBy = user?._id;

            const study = await Study.findById(id);
            if(study && user) {
                const invalidIds = await validateUniqueVariables(id, [json]);
                if(invalidIds.length > 0) {
                    throw new BadRequestError({code: 400, message: "Duplicate records found", logging: true});
                }

                const member = study.members.find(x => x.user == user.id);
                console.log(JSON.stringify(member))
                if(member) {
                    if(member.role === MemberRole.USER) {
                        json.status = ResultStatus.PENDING_APPROVAL;
                    } else {
                        json.status = ResultStatus.APPROVED;
                    }
                    const result = new StudyResult(json);
                    const _result = await result.save();
                    return _result;
                }                
            }            
        }
        
    } catch (error) {
        throw error;
    }
};

export const createResults = async (id: string, json: IStudyResult[], uid: string | undefined) => {
    try {
        if(json?.length > 0) {
            const invalidIds = await validateUniqueVariables(id, json);
            if(invalidIds.length > 0) {
                throw new BadRequestError({code: 400, message: "Duplicate records found", logging: true});
            }
            for(const res of json) {
                createResult(id, res, uid);
            }
        }
        
    } catch (error) {
        throw error;
    }
};

export const getResults = async (params: IStudyResultFilterParams, uid: string) => {
    try {
        console.log('getResults')
        const query = await getResultFilterQuery(params, uid)
        const results = await StudyResult.find(query).populate('createdBy').populate('study');
        return results;
    } catch (error) {
        throw error;
    }
};

export const downloadResults = async (params: IStudyResultFilterParams, uid: string, response: Response) => {
    try {
        console.log('downloadResults')
        const query = await getResultFilterQuery(params, uid)
        const results = await StudyResult.find(query).populate('study').populate('results.variable');
        if(results?.length > 0) {
            const fileName = `${crypto.randomUUID()}.xlsx`;
            try{
                const arr =[];
                for(const result of results) {
                    let obj: any = {};
                    for(const res of result.results) {
                        obj[(res.variable as IStudyVariable).name] = res.value;
                    }
                    arr.push(obj);
                }
                fs.writeFileSync(fileName, '');
                const workSheet = XLSX.utils.json_to_sheet(arr);
                const workBook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workBook, workSheet, 'Sheet 1');
                await XLSX.writeFile(workBook, fileName);

                const stream = fs.createReadStream(fileName);
                const stat = fs.statSync(fileName);

                response.setHeader('Content-Length', stat.size);
                response.setHeader('Content-Type', 'application/octet-stream');
                response.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
                response.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
                stream.pipe(response)
                return;
            }
            catch(err) {

            } finally {
                setTimeout(() => {
                    if (fs.existsSync(fileName)) {
                        fs.unlinkSync(fileName);
                    }
                })
            }
        }
        return results;
    } catch (error) {
        throw error;
    }
};

export const downloadTemplate = async (id: string, response: Response) => {
    try {
        console.log('downloadTemplate')
        const result = await getStudy(id);
        if(result) {
            const fileName = `${crypto.randomUUID()}.csv`;
            try{
                let str = ''
                for(const variable of result.variables) {
                    str += `${variable.name},`
                }
                str += '\n';

                fs.writeFileSync(fileName, str);

                const stream = fs.createReadStream(fileName);
                const stat = fs.statSync(fileName);

                response.setHeader('Content-Length', stat.size);
                response.setHeader('Content-Type', 'application/octet-stream');
                response.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
                response.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
                stream.pipe(response)
                return;
            }
            catch(err) {

            } finally {
                setTimeout(() => {
                    if (fs.existsSync(fileName)) {
                        fs.unlinkSync(fileName);
                    }
                })
            }
        }
    } catch (error) {
        throw error;
    }
};

export const getResult = async (id: string) => {
    try {
        let result = await StudyResult.findById(id).populate('study').populate('createdBy').populate({ 
            path: 'results',
            populate: {
              path: 'variable',
              model: 'studyVariable'
            } 
        });
        return result;
    } catch (error) {
        throw error;
    }
};

export const changeResultStatus = async (id: string, status: string) => {
    try {
        await StudyResult.updateOne({
            _id: id
        }, {
            status
        });
        let result = await StudyResult.findById(id);
        return result;
    } catch (error) {
        throw error;
    }
};

export const deleteResult = async (studyId: string, resultId: string) => {
    try {
        await StudyResult.deleteOne({
            _id: resultId,
            study: studyId
        })
        return true;
    } catch (error) {
        throw error;
    }
};

export const validateUniqueVariables = async (id: string, studyResults: IStudyResult[]) => {
    try {
        const invalidVariables: { index: number; }[] = [];
        const study = await Study.findOne({ _id: id });
        if(study && studyResults.length > 0) {
            const studyVariables = await StudyVariable.find({ study: id, isUnique: true });
            if(studyVariables?.length > 0) {
                for(let [i, x] of studyResults.entries()) {
                    const filterArr: any[] = [];
                    studyVariables.forEach(async studyVariable => {
                        const query: any = {};
                        // query['results.variable'] = x.results.find(x => x.variable === studyVariable._id.toString())?.variable;
                        // if(x.results.find(x => x.variable === studyVariable._id.toString())?.value) {
                        //     query['results.value'] = x.results.find(x => x.variable === studyVariable._id.toString())?.value;
                        // }
                        // if(x.results.find(x => x.variable === studyVariable._id.toString())?.values) {
                        //     query['results.values'] = x.results.find(x => x.variable === studyVariable._id.toString())?.values;
                        // }
                        // filterArr.push(query)
                        query['variable'] = x.results.find(x => x.variable === studyVariable._id.toString())?.variable;
                        if(x.results.find(x => x.variable === studyVariable._id.toString())?.value) {
                            query['value'] = x.results.find(x => x.variable === studyVariable._id.toString())?.value;
                        }
                        if(x.results.find(x => x.variable === studyVariable._id.toString())?.values?.length ?? 0 > 0) {
                            query['values'] = x.results.find(x => x.variable === studyVariable._id.toString())?.values;
                        }
                        filterArr.push({
                            results: {
                                $elemMatch: query
                            }
                        });
                    })
                    const result = await StudyResult.findOne({study: id, $and: filterArr });
                    console.log(result)
                    if(result) {
                        console.log('pusehd')
                        invalidVariables.push({
                            index: i
                        })
                    }
                }

            }
            
        }
        console.log('invalidVariables', invalidVariables)
        return invalidVariables;
    } catch (error) {
        throw error;
    }
};

const getFilterQuery = async (params: IStudyFilterParams, uid: string) => {
    let query: any = {};

    if(params.keyWord) {
        query.name = { $regex: '^' + params.keyWord.trim(), $options: 'i' };
    }
    if(params.status) {
        query.status = params.status;
    }else {
        query.status = StudyStatus.ACTIVE;
    }
    if(params.type) {
        query.type = params.type;
    }
    if(params.category) {
        query.biomType = params.category;
    }

    if(uid) {
        const user = await getUserByUid(uid);

        if(user) {
            query.$or = [{
                createdBy: user._id
            }, {
                "members.user": user._id
            }];
        }
    }

    return query
};

const getResultFilterQuery = async (params: IStudyResultFilterParams, uid: string) => {
    let query: any = {};

    if(params.keyWord) {
        query.reference = { $regex: '^' + params.keyWord.trim(), $options: 'i' };
    }
    if(params.status) {
        query.status = params.status;
    }
    if(params.study) {
        query.study = params.study;
    }
    if(params.variables && params.variables?.length > 0) {
        const arr = [];
        for(const variable of params.variables) {
            if(variable.value) {
                arr.push({
                    "results": {
                        $elemMatch: {
                          "variable": variable.id,
                          "value": variable.value
                        }
                    }
                });
            }
            if(variable.from) {
                arr.push({
                    "results": {
                        $elemMatch: {
                          "variable": variable.id,
                          "value": {
                            $gte: variable.from
                          }
                        }
                    }
                });
            }
            if(variable.to) {
                arr.push({
                    "results": {
                        $elemMatch: {
                          "variable": variable.id,
                          "value": {
                            $lte: variable.to
                          }
                        }
                    }
                });
            }
            
        }
        query.$and = arr;
    }

    if(uid) {
        const user = await getUserByUid(uid);

        if(user) {
            const maintainedStudies = await Study.find({
                "members": {
                  $elemMatch: {
                    "user": user._id,
                    "role": { '$in': [MemberRole.OWNER, MemberRole.MAINTAINER] }
                  }
                }
              }, '_id');
            let maintainedStudyIds = [];
            if(maintainedStudies?.length > 0) {
                maintainedStudyIds = maintainedStudies.map(x => x.id);
                if(params.study) {
                    maintainedStudyIds = maintainedStudyIds.find(x => x == params.study);
                }
            }
            query.$or = [{
                createdBy: user._id
            }, {
                study: {
                    $in: maintainedStudyIds
                }
            }];
        }
    }

    return query
};
