// lib/services/advocateService.ts
import { sql, Column, desc, asc   } from "drizzle-orm";
import db from "../../db";
import { advocates } from "../../db/schema";
import { advocateData } from "../../db/seed/advocates";
import { PgColumn } from "drizzle-orm/pg-core";

import type { Advocate, GetAdvocatesResponse } from "../types/advocates";

export interface GetAdvocatesOptions {
    keyword?: string;
    sortBy?: string; // column name
    sortDir?: "asc" | "desc"; // direction
  }
  
  // Map of sortable columns
  const sortableColumns: Record<string, PgColumn<any>> = {
    id: advocates.id,
    firstName: advocates.firstName,
    lastName: advocates.lastName,
    city: advocates.city,
    degree: advocates.degree,
    yearsOfExperience: advocates.yearsOfExperience,
    phoneNumber: advocates.phoneNumber,
    createdAt: advocates.createdAt,
  };
  
  export async function getAllAdvocates({ keyword, sortBy, sortDir }: GetAdvocatesOptions = {}): Promise<GetAdvocatesResponse>  {
    try {
      const k = `%${keyword?.toLowerCase() || ""}%`;
  
      // Validate column
      const column = sortBy && sortableColumns[sortBy] ? sortableColumns[sortBy] : advocates.id;
      // Validate direction
      const direction = sortDir === "desc" ? desc(column) : asc(column);
  
      const data = await db
        .select()
        .from(advocates)
        .where(
          keyword
            ? sql`LOWER(${advocates.firstName}) LIKE ${k} 
                OR LOWER(${advocates.lastName}) LIKE ${k} 
                OR LOWER(${advocates.city}) LIKE ${k} 
                OR LOWER(${advocates.degree}) LIKE ${k} 
                OR ${advocates.specialties}::text LIKE ${k}
                OR ${advocates.phoneNumber}::text LIKE ${k}
                OR ${advocates.yearsOfExperience}::text LIKE ${k}`
            : undefined
        )
        .orderBy(direction)
        .execute();
  
        return { data };
    } catch (err) {
      console.error("Failed to fetch advocates:", err);
      throw new Error("Could not fetch advocates");
    }
  }
  export async function seedAdvocates() {
    try {
      // Delete existing advocates to avoid duplicates
      await db.delete(advocates);
  
      // Insert seed data
      const records = await db.insert(advocates).values(advocateData).returning();
  
      return { message: "Seeded advocates successfully", count: records.length, records };
    } catch (err) {
      console.error("Failed to seed advocates:", err);
      throw new Error("Could not seed advocates");
    }
  }