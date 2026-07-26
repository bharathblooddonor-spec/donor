/**
 * Static reference data for Andhra Pradesh — the 26 districts as reorganised in
 * 2022, and the blood groups the app supports.
 *
 * This file holds reference data only. Donor and request records come from the
 * backend; there is deliberately no seed/demo data here, because shipping
 * fabricated donor listings with real-format phone numbers is both a store
 * policy violation and a privacy risk.
 */

export const apDistricts = [
  "NTR",
  "Krishna",
  "Guntur",
  "Visakhapatnam",
  "Tirupati",
  "Kurnool",
  "SPS Nellore",
  "East Godavari",
  "Kakinada",
  "West Godavari",
  "Eluru",
  "Prakasam",
  "Ananthapuramu",
  "YSR Kadapa",
  "Chittoor",
  "Vizianagaram",
  "Srikakulam",
  "Bapatla",
  "Palnadu",
  "Anakapalli",
  "Alluri Sitharama Raju",
  "Parvathipuram Manyam",
  "Dr. B.R. Ambedkar Konaseema",
  "Nandyal",
  "Sri Sathya Sai",
  "Annamayya"
];

export const apCitiesByDistrict = {
  "NTR": ["Vijayawada", "Vijayawada Central", "Benz Circle", "Governorpet", "One Town", "Gunadala", "Mylavaram", "Nandigama", "Jaggaiahpet", "Tiruvuru"],
  "Krishna": ["Machilipatnam", "Gudivada", "Pamarru", "Pedana", "Vuyyuru", "Challapalli"],
  "Guntur": ["Guntur City", "Tenali", "Mangalagiri", "Ponnur", "Tadikonda", "Amaravati"],
  "Visakhapatnam": ["Visakhapatnam", "Gajuwaka", "MVP Colony", "Madhurawada", "Pendurthi", "Bheemunipatnam"],
  "Tirupati": ["Tirupati City", "Srikalahasti", "Gudur", "Sullurpeta", "Chandragiri", "Venkatagiri", "Naidupeta"],
  "Kurnool": ["Kurnool City", "Adoni", "Yemmiganur", "Kodumur", "Pattikonda"],
  "SPS Nellore": ["Nellore City", "Kavali", "Atmakur", "Kovur", "Kandukur"],
  "East Godavari": ["Rajahmundry", "Kovvur", "Nidadavole", "Anaparthi", "Gokavaram", "Seethanagaram"],
  "Kakinada": ["Kakinada City", "Samalkota", "Pithapuram", "Tuni", "Peddapuram"],
  "West Godavari": ["Bhimavaram", "Tadepalligudem", "Tanuku", "Narsapuram", "Palakollu"],
  "Eluru": ["Eluru City", "Jangareddigudem", "Nuzvid", "Chintalapudi"],
  "Prakasam": ["Ongole", "Markapur", "Giddalur", "Darsi", "Kanigiri"],
  "Ananthapuramu": ["Anantapur City", "Guntakal", "Tadipatri", "Rayadurg", "Kalyandurg", "Uravakonda"],
  "YSR Kadapa": ["Kadapa City", "Proddatur", "Jammalamadugu", "Pulivendula", "Badvel"],
  "Chittoor": ["Chittoor City", "Punganur", "Nagari", "Palamaner", "Kuppam", "Bangarupalem"],
  "Vizianagaram": ["Vizianagaram", "Bobbili", "Cheepurupalli", "Gajapathinagaram", "Nellimarla", "Salur"],
  "Srikakulam": ["Srikakulam", "Amadalavalasa", "Ichchapuram", "Palasa", "Rajam", "Tekkali"],
  "Bapatla": ["Bapatla", "Chirala", "Repalle", "Addanki", "Parchur", "Vetapalem"],
  "Palnadu": ["Narasaraopet", "Sattenapalle", "Chilakaluripet", "Gurazala", "Macherla", "Piduguralla"],
  "Anakapalli": ["Anakapalli", "Narsipatnam", "Yelamanchili", "Chodavaram", "Madugula"],
  "Alluri Sitharama Raju": ["Paderu", "Rampachodavaram", "Chintapalli", "Araku Valley", "Chintoor"],
  "Parvathipuram Manyam": ["Parvathipuram", "Palakonda", "Kurupam", "Seethampeta", "Gummalakshmipuram"],
  "Dr. B.R. Ambedkar Konaseema": ["Amalapuram", "Ramachandrapuram", "Mummidivaram", "Kothapeta", "Razole"],
  "Nandyal": ["Nandyal", "Dhone", "Allagadda", "Banaganapalle", "Atmakur", "Nandikotkur"],
  "Sri Sathya Sai": ["Puttaparthi", "Dharmavaram", "Kadiri", "Hindupur", "Penukonda", "Madakasira"],
  "Annamayya": ["Rayachoti", "Madanapalle", "Rajampet", "Pileru", "Thamballapalle"]
};

export const apBloodGroups = [
  "O+",
  "O-",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "A1+",
  "A1-",
  "A2+",
  "A2-",
  "A1B+",
  "A1B-",
  "A2B+",
  "A2B-",
  "Bombay Phenotype (Oh+)",
  "Bombay Phenotype (Oh-)",
  "Rh-null (Golden)"
];
