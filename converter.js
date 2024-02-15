// import { programMapping, genderMapping, nationalityMapping } from "./mappings";

function convertFile() {
  const fileInput = document.getElementById("xlsxFile");
  const outputDiv = document.getElementById("output");

  const file = fileInput.files[0];
  if (!file) {
    outputDiv.innerText = "Please choose an XLSX file.";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const sqlDump = generateSqlDump(rows);
    outputDiv.innerText = sqlDump;
  };

  reader.readAsArrayBuffer(file);
}

function generateSqlDump(rows) {
  const header = rows[0];
  const dataRows = rows.slice(1);

  const tableName = "people";

  // Mapping for programs, gender, and nationality
  const programMapping = {
    "BSC TELECOMMUNICATION ENGINEERING": 1,
    "BSC TELECOMMUNICATIONS ENGINEERING (TOP UP)": 1,
    "BSC COMPUTER ENGINEERING": 2,
    "BSC COMPUTER ENGINEERING (TOP UP)": 2,
    "BSC MATHEMATICS": 3,
    "BSC ELECTRICAL AND ELECTRONICS ENGINEERING": 4,
    "BSC ELECTRICAL AND ELECTRONICS ENGINEERING (TOP UP)": 4,
    "DIPLOMA IN TELECOMMUNICATIONS ENGINEERING": 5,
    "DIPLOMA IN TELECOMMUNICATION ENGINEERING": 5,
    "DIPLOMA IN INFORMATION TECHNOLOGY": 6,
    "BSC INFORMATION TECHNOLOGY": 7,
    "BSC INFORMATION TECHNOLOGY (TOP UP)": 7,
    "BSC MOBILE COMPUTING": 8,
    "BSC COMPUTER SCIENCE": 9,
    "BSC COMPUTER SCIENCE (TOP UP)": 9,
    "BSC SOFTWARE ENGINEERING": 10,
    "BSC SOFTWARE ENGINEERING (TOP UP)": 10,
    "BSC DATA SCIENCE AND ANALYTICS": 11,
    "BSC COMPUTER SCIENCE (CYBER SECURITY OPTION)": 12,
    "DIPLOMA IN DATA SCIENCE AND ANALYTICS": 13,
    "DIPLOMA IN CYBER SECURITY": 15,
    "DIPLOMA IN COMPUTER SCIENCE": 16,
    "DIPLOMA IN MULTIMEDIA TECHNOLOGY": 17,
    "DIPLOMA IN WEB APPLICATION DEVELOPMENT": 18,
    "BSC ACCOUNTING WITH COMPUTING": 19,
    "BSC ACCOUNTING WITH COMPUTING (TOP UP)": 19,
    "BSC ECONOMICS": 20,
    "BSC PROCUREMENT AND LOGISTICS": 21,
    "BSC PROCUREMENT AND LOGISTICS (TOP UP)": 21,
    "BSC BANKING AND FINANCE": 22,
    "BSC BUSINESS ADMINISTRATION (BANKING AND FINANCE)": 22,
    "BSC BUSINESS ADMINISTRATION (BANKING AND FINANCE) (TOP UP)": 22,
    "DIPLOMA IN PUBLIC RELATIONS": 23,
    "DIPLOMA IN BUSINESS ADMINISTRATION (MANAGEMENT)": 24,
    "DIPLOMA IN BUSINESS ADMIN (MANAGEMENT OPTION)": 24,
    "DIPLOMA IN BUSINESS ADMIN (ACCOUNTING OPTION)": 25,
    "DIPLOMA IN BUSINESS ADMINISTRATION (ACCOUNTING)": 25,
    "DIPLOMA IN BUSINESS ADMINISTRATION (ACCOUNTING)": 25,
    "DIPLOMA IN BUSINESS ADMIN (MARKETING OPTION)": 26,
    "DIPLOMA IN BUSINESS ADMINISTRATION (MARKETING)": 26,
    "BSC BUSINESS ADMIN (MARKETING OPTION)": 27,
    "BSC BUSINESS ADMINISTRATION (MARKETING)": 27,
    "BSC BUSINESS ADMINISTRATION (MARKETING) (TOP UP)": 27,
    "BSC BUSINESS ADMIN (ACCOUNTING OPTION)": 28,
    "BSC BUSINESS ADMINISTRATION (ACCOUNTING OPTION)": 28,
    "BSC BUSINESS ADMINISTRATION (ACCOUNTING)": 28,
    "BSC BUSINESS ADMINISTRATION (ACCOUNTING OPTION) TOP UP": 28,
    "BSC BUSINESS ADMIN (MANAGEMENT OPTION)": 29,
    "BSC BUSINESS ADMINISTRATION (MANAGEMENT) (TOP UP)": 29,
    "BSC BUSINESS ADMINISTRATION (MANAGEMENT OPTION)": 29,
    "BSC BUSINESS ADMIN (HRM OPTION)": 30,
    "BSC BUSINESS ADMINISTRATION (HUMAN RESOURCE MANAGEMENT) (TOP UP)": 30,
    "BSC BUSINESS ADMINISTRATION (HUMAN RESOURCE MANAGEMENT)": 30,
    "BSC INFORMATION SYSTEMS": 46,
    "BSC INFORMATION SYSTEMS (TOP UP)": 46,
    "BSC INTERNET OF THINGS AND BIG DATA": 47,
    "BSC NETWORKING AND SYSTEMS ADMINISTRATION": 48,
    "CITY & GUILDS PROFESSIONAL PROGRAMME": 49,
    "ABE LEVEL 4 DIPLOMA IN BUSINESS MANAGEMENT": 50,
  };

  const genderMapping = {
    MALE: 1,
    FEMALE: 2,
  };

  const nationalityMapping = {
    GHANA: 62,
    NIGERIA: 126,
    BURKINA: 24,
    BENIN: 18,
    GUINEA: 51,
    "BURKINA FASO": 24,
    "Ivory Coast": 79,
    "COTE D'IVOIRE": 79,
  };

  // Function to get the mapped ID for a value
  const getMappedId = (value, mapping) =>
    mapping[value] !== undefined ? mapping[value] : value;

  const columns = header.map((col) => `\`${col}\``).join(", ");
  const values = dataRows
    .map((row) => {
      // Map program, gender, and nationality to their corresponding IDs
      const programId = getMappedId(
        row[header.indexOf("programme_id")],
        programMapping
      );
      const genderId = getMappedId(
        row[header.indexOf("genderid")],
        genderMapping
      );
      const nationalityId = getMappedId(
        row[header.indexOf("nationality")],
        nationalityMapping
      );

      // Replace program, gender, and nationality values with their IDs
      row[header.indexOf("programme_id")] = programId;
      row[header.indexOf("genderid")] = genderId;
      row[header.indexOf("nationality")] = nationalityId;

      // Generate the values part of the SQL statement
      return `(${row
        .map((value) =>
          Number.isNaN(Number(value)) ? `'${value}'` : `${value}`
        )
        .join(", ")})`;
    })
    .join(",\n");

  const sqlDump = `INSERT INTO \`${tableName}\` (${columns}) VALUES\n${values};`;

  return sqlDump;
}
