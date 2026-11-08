import * as amenitiesModel from '../models/amenities.model.js';

export const getAmenities = () => amenitiesModel.findAllAmenities();
