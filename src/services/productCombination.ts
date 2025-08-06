import { ProductCombinations } from "@/types";
import BaseService from "./base";
import type Http from "./http";

export default class ProductCombinationService extends BaseService<ProductCombinations> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/productCombinations" });
  }
}
