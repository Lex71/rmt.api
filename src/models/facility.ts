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

import { model, PopulatedDoc, Schema } from "mongoose";

import { QueryOptions } from "../types/index";
import { ITable } from "./table";

export interface FacilitySearchOptionsType {
  // query?: Partial<QueryOptions<IFacility>>; // Optional search query, all searchable fields except _id
  // query?: Partial<QueryOptions<IQueryFacility>>; // Optional search query, all searchable fields except _id
  page?: number; // Optional page number for pagination
  sortBy?: string; // Optional field to sort by
  pageSize?: number; // Optional page size for pagination
  sortOrder?: "asc" | "desc"; // Optional sort order, ascending or descending
  query?: Partial<Omit<QueryOptions<IFacility>, "_id">>; // Optional search query, all searchable fields except _id
}

// 1. Create an interface representing a document in MongoDB.
export interface IFacility {
  name: string;
  address: string;
  // _id?: Types.ObjectId;
  tables?: PopulatedDoc<ITable>[];
}

/* interface IFacilityMethods {
  // generateAuthToken(): Promise<string>;
  toJSON(): IFacility;
} */

/* interface FacilityModelType extends Model<IFacility, object, IFacilityMethods> {
 // so far there are no custom methods, so the interface is empty -> declare a typ
} */
// type FacilityModelType = Model<IFacility, object, IFacilityMethods>;

// 2. Create a Schema corresponding to the document interface.
/* const facilitySchema: Schema = new Schema(
  {
    address: { required: true, type: String },
    name: { required: true, type: String },
  },
  { timestamps: true },
); */

const facilitySchema = new Schema(
  {
    address: { required: true, type: String },
    name: { required: true, type: String },
    tables: [{ ref: "Table", type: Schema.Types.ObjectId }],
    // tables: { ref: "Table", type: [Schema.Types.ObjectId] },
  },
  {
    // methods: {
    //   toJSON() {
    //     const facility = this as HydratedDocument<IFacility> & IFacility;
    //     const facilityObject = facility.toObject();
    //     // delete facilityObject._id;
    //     return facilityObject;
    //   },
    // },
    /* pre: {
      // check for existing reference on Table before 'remove'
      deleteOne: function (next: CallbackWithoutResultAndOptionalError) {
        Table.find(
          {
            facility: (
              this as unknown as HydratedDocument<IFacility> & IFacility
            ).id,
          },
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
      },
    }, */
    timestamps: true,
  },
);

// check for existing reference on Table before 'remove'
facilitySchema.pre("deleteOne", async function (next) {
  const f = await Facility.findById(this.getQuery()).populate("tables").exec();
  console.log(f?.tables);
  if (f?.tables.length) next(new Error("This facility has tables still"));
  else next();
});

// 3. Create a Model.
const Facility = model("Facility", facilitySchema);

export default Facility;
