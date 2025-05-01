'use server'

import { auth } from "@/lib/auth";
import { db } from "@/src/db"
import { patientsTable} from "@/src/db/schema"
import { headers } from "next/headers";

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
    const session = await auth.api.getSession({
      headers: await headers(),
  });
     
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
      userId: session?.user.id
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
