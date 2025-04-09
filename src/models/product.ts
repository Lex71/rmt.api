import { Document, model, Schema, Types } from "mongoose";

export interface Product extends Document {
  name: string;
  price: number;
  facility?: Types.ObjectId;
}

const productSchema = new Schema(
  {
    facility: { ref: "Facility", type: Schema.Types.ObjectId },
    name: { required: true, type: String },
    price: { required: true, type: Number },
  },
  {
    query: {
      byPrice(price: number) {
        return this.where("price").equals(price);
      },
    },
    timestamps: true,
  },
);

// productSchema.query.byPrice = function(price: number) {
//   return this.where('price').equals(price);
// };

export const ProductModel = model<Product>("Product", productSchema);

const product = new ProductModel({ name: "Example Product", price: 19.99 });
product
  .save()
  .then((product) => {
    console.log(product);
  })
  .catch((err: unknown) => {
    console.error(err);
  });

ProductModel.find()
  .exec()
  .then((product) => {
    console.log(product);
  })
  .catch((err: unknown) => {
    console.error(err);
  });
