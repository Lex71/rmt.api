import {
  Document,
  HydratedDocument,
  model,
  QueryOptions,
  // Model,
  // QueryWithHelpers,
  Schema,
  Types,
} from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface ITable extends Document {
  description?: string;
  facility: Types.ObjectId;
  name: string;
  seats: number;
}

export interface TableSearchOptionsType {
  // query?: Partial<QueryOptions<ITable>>; // Optional search query, all searchable fields except _id
  // query?: Partial<QueryOptions<IQueryTable>>; // Optional search query, all searchable fields except _id
  page?: number; // Optional page number for pagination
  pageSize?: number; // Optional page size for pagination
  query?: Partial<Omit<QueryOptions<ITable>, "_id">>; // Optional search query, all searchable fields except _id
  sortBy?: string; // Optional field to sort by
  sortOrder?: "asc" | "desc"; // Optional sort order, ascending or descending
}

export const tableSchema = new Schema(
  {
    description: { type: String },
    facility: { ref: "Facility", required: true, type: Schema.Types.ObjectId },
    name: { required: true, type: String },
    seats: { required: true, type: Number },
  },
  {
    methods: {
      toJSON() {
        const table = this as HydratedDocument<ITable> & ITable;
        const tableObject = table.toObject();
        // delete tableObject._id;
        return tableObject;
      },
    },
    // query: {
    //   bySeats(seats: number) {
    //     return this.find({ seats });
    //   },
    // },
    timestamps: true,
  },
);

/* tableSchema.methods.toJSON = function () {
  const table = this as HydratedDocument<ITable> & ITable;
  const tableObject = table.toObject();
  // delete tableObject._id;
  return tableObject;
}; */

// 3. Create a Model.
// const Table: Model<ITable> = model<ITable, TableModelType>(
/* 
const Table = model<ITable, TableModelType>("Table", tableSchema);
 */
const Table = model("Table", tableSchema);

export default Table;
