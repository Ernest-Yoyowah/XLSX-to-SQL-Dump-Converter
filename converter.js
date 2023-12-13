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

  const columns = header.map((col) => `\`${col}\``).join(", ");
  const values = dataRows
    .map((row) => `(${row.map((value) => `'${value}'`).join(", ")})`)
    .join(",\n");

  const sqlDump = `INSERT INTO \`${tableName}\` (${columns}) VALUES\n${values};`;

  return sqlDump;
}
