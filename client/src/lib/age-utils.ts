/**
 * Utility functions for consistent age handling across the application
 */

export function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

export function getAgeRange(birthDate: Date | number): string {
  const age = typeof birthDate === 'number' ? birthDate : calculateAge(birthDate);
  
  if (age < 18) return "Under 18";
  if (age >= 18 && age <= 25) return "18-25";
  if (age >= 26 && age <= 30) return "26-30";
  if (age >= 31 && age <= 40) return "31-40";
  if (age >= 41 && age <= 50) return "41-50";
  if (age > 50) return "50+";
  
  return "Unknown";
}

export function getAgeRangeFromString(ageString: string): string {
  // Handle existing age ranges
  if (ageString.includes("-") || ageString.includes("+")) {
    return ageString;
  }
  
  // Handle specific ages
  const age = parseInt(ageString);
  if (!isNaN(age)) {
    return getAgeRange(age);
  }
  
  return ageString;
}

// Standardized age ranges for filtering
export const AGE_RANGE_OPTIONS = [
  "18-25",
  "26-30", 
  "31-40",
  "41-50",
  "50+"
];