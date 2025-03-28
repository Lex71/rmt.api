import {
  Document,
  // HydratedDocument,
  model,
  Model /* , Document */,
  QueryWithHelpers,
  Schema,
  Types,
} from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface ITable extends Document {
  name: string;
  seats: number;
  facility: Types.ObjectId;
}

interface TableQueryHelpers {
  bySeats(seats: number): QueryWithHelpers<
    // HydratedDocument<ITable>[],
    // HydratedDocument<ITable>,
    ITable[],
    ITable,
    TableQueryHelpers
  >;
}

type TableModelType = Model<ITable, TableQueryHelpers>;

// 2. Create a Schema corresponding to the document interface.
const TableSchema = new Schema<
  ITable,
  Model<ITable, TableQueryHelpers>,
  {},
  TableQueryHelpers
>({
  name: { type: String, required: true },
  seats: { type: Number, required: true },
  facility: { type: Schema.Types.ObjectId, ref: "Facility" },
});

// Query Helpers
TableSchema.query.bySeats = function bySeats(
  // this: QueryWithHelpers<any, HydratedDocument<ITable>, TableQueryHelpers>,
  this: QueryWithHelpers<any, ITable, TableQueryHelpers>,
  seats: number,
) {
  return this.find({ seats: seats });
};

// 3. Create a Model.
const Table: Model<ITable> = model<ITable, TableModelType>(
  "Table",
  TableSchema,
);

export default Table;
