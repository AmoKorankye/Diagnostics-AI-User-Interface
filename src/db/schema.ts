import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').unique().notNull(),
  phone: text('phone').notNull()
});

export const patientsTable = sqliteTable('patients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  gender: text('gender').notNull(),
  dateOfBirth: text('date_of_birth').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address'),
  emergencyContactName: text('emergency_contact_name').notNull(),
  emergencyContactRelation: text('emergency_contact_relation').notNull(),
  emergencyContactPhone: text('emergency_contact_phone').notNull(),
  bloodGroup: text('blood_group'),
  allergies: text('allergies'),
  preExistingConditions: text('pre_existing_conditions'),
  height: real('height'),
  weight: real('weight'),
  doctorsName: text('doctors_name').notNull(),
  userId: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' })
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertPatient = typeof patientsTable.$inferInsert;
export type SelectPatient = typeof patientsTable.$inferSelect;
