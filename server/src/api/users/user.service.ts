import { comparePassword, generateToken, hashPassword } from "../../shared/firebase.service";
import User, { AppId, IUser, IUserDTO, IUserFilterParams } from "./user.model";

export const createUser = async (json: IUserDTO) => {
    try {
        if ((json.appId?.length ?? 0) === 0) {
            json.appId = [AppId.BIOM];
        }

        if (json.password) {
            json.password = await hashPassword(json.password);
        }

        const user = new User(json);
        const result = await user.save();

        // Set uid to the mongo _id string
        result.uid = result._id.toString();
        await result.save();

        return result;
    } catch (error) {
        throw error;
    }
};

export const loginUser = async (email: string, password: string) => {
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await comparePassword(password, user.password!);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        const token = generateToken({
            uid: user.uid,
            email: user.email,
            userType: user.userType,
        });

        return { token, user: { uid: user.uid, name: user.name, email: user.email, userType: user.userType, appId: user.appId } };
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

    if (params.keyWord) {
        query.$or = [
            { name: { $regex: '^' + params.keyWord.trim(), $options: 'i' } },
            { email: { $regex: '^' + params.keyWord.trim(), $options: 'i' } }
        ];
    }
    if (params.uid) {
        query.uid = params.uid;
    }
    if (params.appId) {
        query.appId = params.appId;
    }
    if (params.nids && params.nids?.length > 0) {
        query._id = { $nin: params.nids };
    }
    return query;
};
