import * as FirebaseService from "../../shared/firebase.service";
import User, { AppId, IUser, IUserDTO, IUserFilterParams } from "./user.model";

export const createUser = async (json: IUserDTO) => {
    try {
        if((json.appId?.length ?? 0)=== 0) {
            json.appId = [AppId.BIOM]
        }
        const uid = await FirebaseService.createUser(json.email, json.password!, json.name, json.userType);
        if(uid) {
            json.uid = uid;
            const user = new User(json);
            const result = await user.save();
            return result;
        } else{
            throw new Error('User creation failed');
        }
        
    } catch (error) {
        throw error;
    }
};

export const getUserByUid = async (uid: string) => {
    try {
        const user = await User.findOne({ uid });
        return user;
    } catch (error) {
        throw error;
    }
};

export const getUsers = async (params: IUserFilterParams) => {
    try {
        const query = getFilterQuery(params);
        const users = await User.find(query);
        return users;
    } catch (error) {
        throw error;
    }
};

const getFilterQuery = (params: IUserFilterParams) => {
    let query: any = {};

    if(params.keyWord) {
        query.name = { $regex: '^' + params.keyWord.trim(), $options: 'i' };
        query.email = { $regex: '^' + params.keyWord.trim(), $options: 'i' };
    }
    if(params.uid) {
        query.uid = params.uid;
    }
    if(params.appId) {
        query.appId = params.appId;
    }
    if(params.nids && params.nids?.length > 0) {
        query._id = {
            $nin: params.nids
        };
    }
    return query
};
