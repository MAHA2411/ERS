import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const SuccessPage = () => {
  const { registrationId } = useParams();
  const [reg, setReg] = useState(null);

  useEffect(()=> {
    if (!registrationId) return;
    axios.get(`/registrations/${registrationId}`) // optional endpoint; if not created, show static message
      .then(r => setReg(r.data))
      .catch(() => setReg(null));
  }, [registrationId]);

  return (
    <>
      <Navbar />
      <div className="container" style={{ marginTop: 110, textAlign: "center" }}>
        <h1>Registration Successful!</h1>
        <p>We've emailed your ticket. Please download and save it.</p>
        {reg ? (
          <>
            <h3>Ticket ID: {reg.ticketId}</h3>
            <p>Name: {reg.name} | Email: {reg.email}</p>
            {/* If you saved PDF to server, provide link; or instruct to check email. */}
          </>
        ) : (
          <p>If you don't see details here, check your registered email for the ticket PDF.</p>
        )}
      </div>
    </>
  );
};

export default SuccessPage;
