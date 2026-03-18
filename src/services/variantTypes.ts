import { VariantTypes } from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class VariantTypeService extends BaseService<VariantTypes> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/variant-types" });
  }
}
