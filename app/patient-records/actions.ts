'use server'

import { db } from "@/src/db"
import { patientsTable, usersTable } from "@/src/db/schema"

type PatientInfo = {
  firstName: string
  lastName: string
  gender: string
  dateOfBirth: string
  phone: string
  email?: string
  address?: string
  emergencyContactName: string
  emergencyContactRelation: string
  emergencyContactPhone: string
  bloodGroup?: string
  allergies?: string
  preExistingConditions?: string
  height?: string
  weight?: string
  doctorsName: string
}

export async function savePatientRecord(patientInfo: PatientInfo) {
  try {
    // First create a new user
    const userResult = await db.insert(usersTable).values({
      firstName: patientInfo.firstName,
      lastName: patientInfo.lastName,
      email: patientInfo.email || `${patientInfo.firstName.toLowerCase()}.${patientInfo.lastName.toLowerCase()}@example.com`, // Fallback email
      phone: patientInfo.phone,
    }).returning({ insertedId: usersTable.id });
    
    // Extract the auto-generated user ID
    const userId = userResult[0].insertedId;
    
    // Then create the patient record with the user ID
    await db.insert(patientsTable).values({
      firstName: patientInfo.firstName,
      lastName: patientInfo.lastName,
      gender: patientInfo.gender,
      dateOfBirth: patientInfo.dateOfBirth,
      phone: patientInfo.phone,
      email: patientInfo.email || null,
      address: patientInfo.address || null,
      emergencyContactName: patientInfo.emergencyContactName,
      emergencyContactRelation: patientInfo.emergencyContactRelation,
      emergencyContactPhone: patientInfo.emergencyContactPhone,
      bloodGroup: patientInfo.bloodGroup || null,
      allergies: patientInfo.allergies || null,
      preExistingConditions: patientInfo.preExistingConditions || null,
      height: patientInfo.height ? parseFloat(patientInfo.height) : null,
      weight: patientInfo.weight ? parseFloat(patientInfo.weight) : null,
      doctorsName: patientInfo.doctorsName,
      userId: userId // Corrected field name to match the schema
    });
    
    return { success: true }
  } catch (error) {
    console.error("Server action error:", error)
    
    // Check if error is related to email uniqueness constraint
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("UNIQUE constraint failed: users.email")) {
      return { 
        success: false, 
        error: "Email already exists. Confirm your email Address"
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to save patient record" 
    }
  }
}
