// Test multipart/form-data upload to /api/analyze
const minimalPdfString = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 72 >> stream
BT
/F1 12 Tf
72 712 Td
(Priya Sharma AI Engineer Python PyTorch Docker FastAPI) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000244 00000 n 
0000000366 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
440
%%EOF`;

async function testUpload() {
  const blob = new Blob([minimalPdfString], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('resume', blob, 'Priya_Sharma_Resume.pdf');
  formData.append('jobDescription', 'Senior AI Engineer specializing in Python, PyTorch, Docker, and FastAPI microservices.');

  console.log('Sending multipart/form-data with PDF to http://localhost:3000/api/analyze...');
  const res = await fetch('http://localhost:3000/api/analyze', {
    method: 'POST',
    body: formData,
  });

  console.log(`Status: ${res.status}`);
  const json = await res.json();
  console.log('Response:', JSON.stringify(json, null, 2));
}

testUpload().catch(console.error);
