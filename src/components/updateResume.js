import React, { useState, useEffect } from "react";
import { ref, getDatabase, update } from "firebase/database";
import app from "./firebase";
import { auth } from "./firebase";
import { pdfjs } from 'react-pdf';
import { toast } from "react-toastify";
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdfjs/pdf.worker.min.js`





const UpdateResume = function () {
  const [Currentctc, setCurrentctc] = useState("");
  const [Expectedctc, setExpectedctc] = useState("")
  const [NoticePeriod, setNoticePeriod] = useState("");
  const [Resume, setResume] = useState("");
  const [pdfText, setPdfText] = useState('');
  const [Location, setLocation] = useState([]);
  const [user, setUser] = useState("")
  const [pdfName,setPdfName] = useState("")
  // const db = getDatabase(app)


  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });


  })



  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    console.log(file.name)
    setPdfName(file.name)
    // toast.success("Resume Uploaded!")
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const typedarray = new Uint8Array(e.target.result);
        const pdf = await pdfjs.getDocument(typedarray).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        console.log(fullText)
        setPdfText(fullText);
        setResume(file.name); // Set the file name in the Resume state
      };
      reader.readAsArrayBuffer(file);
    }
  };
const OnSubmit = async(e)=>{
  e.preventDefault()
  toast.success("Resume Uploaded!")

}

  const handleSubmit = async (e) => {
    const db = getDatabase(app)
    e.preventDefault();
    console.log(Currentctc, Expectedctc, NoticePeriod, Resume, Location)

    //Event Listner
    function notifyExtensionOnResumeUpdated(urd) {
      const event = new CustomEvent('resumeUpdated', { detail: { urd } });
      document.dispatchEvent(event);
    }


    // Example usage after the resume data is updated
    const urdData = pdfText + `currentCtc -${Currentctc}; ExpectedCtc -${Expectedctc}; NoticePeriod-${NoticePeriod}; Location-${Location}`;
    notifyExtensionOnResumeUpdated(urdData);

    const uid = auth.currentUser.uid;
    const userRef = ref(db, 'Users/' + uid);
    await update(userRef, {
      "forms": {
        "keyvalues": {

          "RD": pdfText,
          "URD": pdfText + `currentCtc -${Currentctc}; ExpectedCtc -${Expectedctc}; NoticePeriod-${NoticePeriod}; Location-${Location} `
        }
      }

    }).then(async () => {
      toast.success("Document Updated Successfully!");
      localStorage.setItem("Subscriptiontype", "FreeTrialStarted");
      const getSubscription = ref(db, "Users/" + user?.uid + "/Payment");
      await update(getSubscription, {
        Subscriptiontype: "FreeTrialStarted",

      })
      //   console.log("Resume")
      window.location.href = "/User"



    }).catch((err) => {
      toast.error(err)
    })








  }

  return (
    <div>
      <main>



        <h1>Last Step</h1>
        <div className="contact-container">
          <div className="message-section">
            <h2>Start Auto-applying now!</h2>
            <p>
              Achieve career success with Job Form Automator! Start Auto-applying now!</p>
          </div>
          <div className="form-section">
            <form onSubmit={handleSubmit}>
              <p>Current CTC in your local currency?</p>
              <input type="text" placeholder="Current CTC" required onChange={(e) => setCurrentctc(e.target.value)} />
              <p>Expected CTC in your local currency?</p>
              <input type="text" placeholder="Expected CTC" required onChange={(e) => setExpectedctc(e.target.value)} />
              <p>What is your notice period in days?</p>
              <input type="text" placeholder="Notice Period" required onChange={(e) => setNoticePeriod(e.target.value)} />
              <p>your All preferred locations for jobs?</p>
              <input type="text" placeholder="Preferred Locations" required onChange={(e) => setLocation(e.target.value)} />
              <label htmlFor="file-upload" className="custom-file-upload">
                Upload Resume
              </label>
              <input id="file-upload" type="file" accept="application/pdf" onChange={handleFileUpload}  required />
              <span className="file-name"></span>
              <p>{pdfName?pdfName :""}</p>
              <button type="submit">Submit</button>

            </form>
          </div>
        </div>
      </main>

    </div>
  )
}
export default UpdateResume;




