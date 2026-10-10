import { getImageUrl, uploadFile } from "../../shared/firebase.service";
import { UserType } from "../users/user.model";
import { getUserByUid } from "../users/user.service";
import BioMarker, { BioMarkerStatus, IBioMarker, IBioMarkerFilterParams } from "./biomarker.model";

export const createBioMarker = async (json: IBioMarker, uid: string | undefined) => {
    try {
        if(uid) {
            const user = await getUserByUid(uid);
            json.uploadedBy = user?._id;
            if(user?.userType === UserType.ADMIN) {
                json.status = BioMarkerStatus.APPROVED;
            } else {
                json.status = BioMarkerStatus.PENDING;
            }
            const bioMarker = new BioMarker(json);
            const result = await bioMarker.save();

            if(json?.image) {
                const imagePath = await uploadFile(`images/biom/${result._id}`, json.image);
                result.imagePath = imagePath;
                await bioMarker.save();
            }
            return result;
        }
        
    } catch (error) {
        throw error;
    }
};

export const getBioMarkers = async (params: IBioMarkerFilterParams) => {
    try {
        const query = getFilterQuery(params)
        const results = BioMarker.find(query);
        return results;
    } catch (error) {
        throw error;
    }
};

export const getBioMarker = async (id: string) => {
    try {
        let result = await BioMarker.findById(id);
        if(result && result?.imagePath) {
            const imageUrl = await getImageUrl(result.imagePath);
            const marker = {...result.toObject()};
            marker.imageUrl = imageUrl;
            return marker;
        }
        return result;
    } catch (error) {
        throw error;
    }
};

const getFilterQuery = (params: IBioMarkerFilterParams) => {
    let query: any = {};

    if(params.keyWord) {
        query.name = { $regex: '^' + params.keyWord.trim(), $options: 'i' };
        query.shortName = { $regex: '^' + params.keyWord.trim(), $options: 'i' };
        query.commonName = { $regex: '^' + params.keyWord.trim(), $options: 'i' };
    }
    if(params.status) {
        query.status = params.status;
    }else {
        query.status = BioMarkerStatus.APPROVED;
    }
    if(params.type) {
        query.type = params.type;
    }
    if(params.biomType) {
        query.biomType = params.biomType;
    }

    return query
};

export const updateStatus = async (id: string, status: string) => {
    try {
        let result = await BioMarker.updateOne({
            _id: id
        },{
            $set: {
                status
            }
        });
        return result;
    } catch (error) {
        throw error;
    }
};