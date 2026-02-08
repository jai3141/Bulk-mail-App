import axios from "axios";
import { useState } from "react";
import * as XLSX from "xlsx";

function App() {
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(false);
  const [emailList, setEmailList] = useState([]);

  /* Handle message typing */
  function handleMsg(e) {
    setMsg(e.target.value);
  }

  /* Handle Excel / CSV upload */
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json(worksheet, { header: "A" });
      const emails = rows.map(row => row.A).filter(Boolean);

      setEmailList(emails);
    };

    reader.readAsArrayBuffer(file);
  }

  /* Send mail */
  async function send() {
    if (!msg || emailList.length === 0) {
      alert("Message or email list empty ❌");
      return;
    }

    try {
      setStatus(true);

      const res = await axios.post(
        "https://bulk-mail-app-u5p6.onrender.com/sendmail",
        {
          msg,
          emailList
        }
      );

      if (res.data.success) {
        alert("Email Sent Successfully ✅");
        setMsg("");
        setEmailList([]);
      } else {
        alert(res.data.message || "Email not sent ❌");
      }
    } catch (error) {
      console.error(error);
      alert("Server error ❌");
    } finally {
      setStatus(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient from-slate-100 to-blue-100 flex flex-col">
      
      {/* Header */}
      <header className="bg-blue-950 text-white py-4 shadow">
        <h1 className="text-2xl font-semibold text-center tracking-wide">
          📧 BulkMail
        </h1>
        <p className="text-sm text-center text-blue-200 mt-1">
          Send multiple emails easily in one click
        </p>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6">

          {/* Message */}
          <div className="mb-5">
            <label className="block font-medium mb-2 text-gray-700">
              Email Content
            </label>
            <textarea
              value={msg}
              onChange={handleMsg}
              placeholder="Type your email message here..."
              className="w-full h-40 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* File upload */}
          <div className="mb-4">
            <label className="block font-medium mb-2 text-gray-700">
              Upload Email List (CSV / Excel)
            </label>

            <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 text-center hover:bg-blue-50 transition">
              <input type="file" onChange={handleFile} />
              <p className="text-sm text-gray-500 mt-2">
                Drag & drop or click to upload
              </p>
            </div>
          </div>

          {/* Count */}
          <p className="text-sm text-gray-600 mb-4">
            Total emails in file:{" "}
            <span className="font-semibold">{emailList.length}</span>
          </p>

          {/* Button */}
          <button
            onClick={send}
            disabled={status}
            className="w-full bg-blue-950 hover:bg-blue-900 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition"
          >
            {status ? "Sending Emails..." : "Send Emails"}
          </button>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-3">
        © 2026 BulkMail App
      </footer>

    </div>
  );
}

export default App;
