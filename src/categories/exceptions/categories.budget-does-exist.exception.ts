import { NotAcceptableException } from "@nestjs/common";

export class CategoriesBudgetDoesntExistException extends NotAcceptableException {
  constructor() {
    super("Budget Id is mandatory");
  }
}
