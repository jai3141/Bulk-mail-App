import axios from "axios";
import { useState } from "react";
import * as XLSX from "xlsx";

function App() {

  const [msg, setMsg] = useState("")
  const [status, setStatus] = useState(false)
  const [emailList, setEmaillist] = useState([])

  function handlemsg(evt) {
    setMsg(evt.target.value)
  }

  function handlefile(event) {
    const file = event.target.files[0]

    const reader = new FileReader()

    reader.onload = function (event) {
      const data = event.target.result
      const workbook = XLSX.read(data, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const WorkSheet = workbook.Sheets[sheetName]
      const emailList = XLSX.utils.sheet_to_json(WorkSheet, { header: 'A' })
      const totalemail = emailList.map(function (item) { return item.A })
      console.log(totalemail)
      setEmaillist(totalemail)
    }

    reader.readAsArrayBuffer(file)
  }

  function send() {
    setStatus(true)
    axios.post("http://localhost:4000/sendmail", { msg: msg, emailList:emailList})
      .then(function (data) {
        if (data.data === true) {
          alert("Email Sent Sucessfully")
          setStatus(false)
        }
        else {
          alert("Email not sent failed")
        }
      })
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

      {/* Main Card */}
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6">

          {/* Email Content */}
          <div className="mb-5">
            <label className="block font-medium mb-2 text-gray-700">
              Email Content
            </label>
            <textarea onChange={handlemsg} value={msg}
              placeholder="Type your email message here..."
              className="w-full h-40 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="block font-medium mb-2 text-gray-700">
              Upload Email List (CSV / Excel)
            </label>

            <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 text-center hover:bg-blue-50 transition">
              <input type="file" onChange={handlefile} className="mx-auto cursor-pointer" />
              <p className="text-sm text-gray-500 mt-2">
                Drag & drop or click to upload
              </p>
            </div>
          </div>

          {/* Count */}
          <p className="text-sm text-gray-600 mb-4">
            Total emails in file: <span className="font-semibold">{emailList.length}</span>
          </p>

          {/* Action Button */}
          <button onClick={send} className="w-full bg-blue-950 hover:bg-blue-900 text-white py-3 rounded-lg font-medium transition">
            {status ? "sending Emails..." : "Send Emails"}
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
