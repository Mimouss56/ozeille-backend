import { NotAcceptableException } from "@nestjs/common";

export class UserPasswordDoesntMatchException extends NotAcceptableException {
  constructor() {
    super("Passwords do not match");
  }
}
