import { VariantTypes } from "@/types";
import BaseService from "./base";
import type Http from "./http";

export default class VariantService extends BaseService<VariantTypes> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/variant-types" });
  }
}
