// const mongoose = require('mongoose')
// const Table = require('./table')

/**
 * The Facility() constructor returns an instance of HydratedDocument<IFacility>. 
 * IFacility is a document interface, it represents the raw object structure that IFacility objects look like in MongoDB. 
 * HydratedDocument<IFacility> represents a hydrated Mongoose document, with methods, virtuals, and other Mongoose-specific features.
 * 
 * import { HydratedDocument } from 'mongoose';
 * 
 * const user: HydratedDocument<IFacility> = new Facility({
    name: 'Birrificio Pedavena',
    address: "via Statale 108-bis, Beverate LC"
  });

 */

import {
  CallbackError,
  Document,
  HydratedDocument,
  // HydratedDocument,
  model,
  Model,
  Schema,
} from "mongoose";
import Table, { ITable } from "./table";

import { QueryOptions } from "../types/index";

// 1. Create an interface representing a document in MongoDB.
export interface IFacility extends Document {
  name: string;
  address: string;
}

export interface IFacilityMethods {
  // generateAuthToken(): Promise<string>;
  toJSON(): IFacility;
}

interface UserModel extends Model<IFacility, {}, IFacilityMethods> {
  // findByCredentials(
  //   email: string,
  //   password: string,
  // ): Promise<HydratedDocument<IFacility, IFacilityMethods>>;
}

export type FacilitySearchOptionsType = {
  query?: Partial<Omit<QueryOptions<IFacility>, "_id">>; // Optional search query, all searchable fields except _id
  // query?: Partial<QueryOptions<IFacility>>; // Optional search query, all searchable fields except _id
  // query?: Partial<QueryOptions<IQueryFacility>>; // Optional search query, all searchable fields except _id
  page?: number; // Optional page number for pagination
  pageSize?: number; // Optional page size for pagination
  sortBy?: string; // Optional field to sort by
  sortOrder?: "asc" | "desc"; // Optional sort order, ascending or descending
};

// 2. Create a Schema corresponding to the document interface.
const facilitySchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
});

// check for existing reference on Table before 'remove'
facilitySchema.pre<IFacility>("deleteOne", function (next) {
  Table.find(
    { facility: this.id },
    // (err: CallbackError | undefined, tables: HydratedDocument<ITable>[]) => {
    (err: CallbackError | undefined, tables: ITable[]) => {
      if (err) {
        next(err);
      } else if (tables.length > 0) {
        next(new Error("This facility has tables still"));
      } else {
        next();
      }
    },
  );
});

facilitySchema.methods.toJSON = function () {
  const facility = this as IFacility;
  const facilityObject = facility.toObject();
  // delete facilityObject._id;
  return facilityObject;
};

// 3. Create a Model.
// const Facility: Model<IFacility> = model<IFacility>("Facility", facilitySchema);
const Facility = model<IFacility, UserModel>("Facility", facilitySchema);
export default Facility;
