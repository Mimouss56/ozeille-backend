import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Request } from "express";
import { Observable, map } from "rxjs";

import { Link, Meta, PaginatedDatabaseResponse } from "../types";

@Injectable()
export class PaginatedResponseInterceptor<T extends { id: string }> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();

    const acceptHeader = request.headers["accept"];
    const isJsonApi = acceptHeader === "application/vnd.api+json";

    return next.handle().pipe(
      map((data: PaginatedDatabaseResponse<T>) => {
        // 1. If standard JSON is requested, return as is
        if (!isJsonApi) {
          return data;
        }

        // 2. Switch to JSON:API Content-Type
        response.setHeader("Content-Type", "application/vnd.api+json");

        return this.transformPaginatedResponse(data, request);
      }),
    );
  }

  private transformPaginatedResponse(payload: PaginatedDatabaseResponse<T>, request: Request) {
    return {
      meta: payload.meta,
      links: this.generateLinks(payload.meta, request),
      data: payload.data.map((item) => this.mapSingleResource(item)),
    };
  }

  private mapSingleResource(item: T) {
    const { id, ...attributes } = item;

    return {
      type: "resource",
      id: id.toString(),
      attributes,
    };
  }

  private generateLinks(meta: Meta, request: Request) {
    // Helper to build URL with a new page number
    const buildUrl = (page: number) => {
      const url = new URL(`${request.protocol}://${request.get("host")}${request.originalUrl}`);
      url.searchParams.set("page", page.toString());
      return url.toString();
    };

    const links: Link = {
      self: buildUrl(meta.page),
      first: buildUrl(1),
      last: buildUrl(meta.totalPages),
    };

    if (meta.page < meta.totalPages) {
      links.next = buildUrl(meta.page + 1);
    }

    if (meta.page > 1) {
      links.prev = buildUrl(meta.page - 1);
    }

    return links;
  }
}
