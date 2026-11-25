import { db, auth } from "./firebase.js";

console.log("Firebase initialized successfully!");
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
// Sample donor information for demonstration
let donors = [
    {
        name: "Rahul",
        blood: "B+",
        city: "Howrah"
    },
    {
        name: "Priya",
        blood: "O+",
        city: "Kolkata"
    },
    {
        name: "Amit",
        blood: "A+",
        city: "Howrah"
    },
    {
        name: "Sneha",
        blood: "AB+",
        city: "Kolkata"
    },
    {
        name: "Arjun",
        blood: "B-",
        city: "Howrah"
    }
];

let requests = [];

// Donor registration

 // Donor registration using Firestore
document.getElementById("donorForm")
.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("donorName").value.trim();
    const blood = document.getElementById("donorBlood").value;
    const city = document.getElementById("donorCity").value.trim();

    const consent = document.getElementById("donorConsent").checked;

    const message = document.getElementById("registerMessage");

    if (!auth.currentUser) {
        message.textContent = "Please login first.";
        return;
    }

    try {

        await addDoc(collection(db, "donors"), {
            name: name,
            blood: blood,
            city: city,
            userId: auth.currentUser.uid,
            createdAt: serverTimestamp()
        });

        if (consent) {
            await addDoc(collection(db, "donorListings"), {
                name: name,
                blood: blood,
                city: city,
                userId: auth.currentUser.uid,
                consent: true,
                createdAt: serverTimestamp()
            });
        }

        message.textContent = "Donor registered successfully!";
        this.reset();

    } catch (error) {
        console.error(error);
        message.textContent = "Registration failed. Please try again.";
    }
});

// Search donors
// Search donors using Firestore
async function findDonors() {

    const blood = document.getElementById("searchBlood").value;

    const city = document.getElementById("searchCity")
        .value.trim().toLowerCase();

    const output = document.getElementById("donorResults");

    output.innerHTML = "";

    if (!auth.currentUser) {
        output.textContent = "Please login first.";
        return;
    }

    if (blood === "") {
        output.textContent = "Please select a blood group.";
        return;
    }

    try {

        const snapshot = await getDocs(
            collection(db, "donorListings")
        );

        let results = [];

        snapshot.forEach(function(doc) {

            const donor = doc.data();

            if (
                donor.blood === blood &&
                donor.city.toLowerCase().includes(city)
            ) {
                results.push(donor);
            }

        });

        if (results.length === 0) {
            output.textContent = "No matching donors found.";
            return;
        }

        results.forEach(function(donor) {

            let card = document.createElement("div");
            card.className = "donor-card";

            let details = document.createElement("p");

            details.textContent =
                "Name: " + donor.name +
                " | Blood: " + donor.blood +
                " | Location: " + donor.city;

            card.appendChild(details);
            output.appendChild(card);

        });

    } catch (error) {

        console.error("Donor search error:", error);
        output.textContent = "Could not search donors.";

    }
}

  

// Submit blood request
// Submit donor request using Firestore
document.getElementById("requestForm")
.addEventListener("submit", async function(event) {

    event.preventDefault();

    const patient = document.getElementById("patientName").value.trim();
    const blood = document.getElementById("requestBlood").value;
    const hospital = document.getElementById("hospital").value.trim();
    const consent = document.getElementById("requestConsent").checked;

    const message = document.getElementById("requestResults");

    if (!auth.currentUser) {
        message.textContent = "Please login first.";
        return;
    }

    try {

        await addDoc(collection(db, "requests"), {

            patient: patient,
            blood: blood,
            hospital: hospital,
            status: "Pending",
            userId: auth.currentUser.uid,
            createdAt: serverTimestamp()

        });
        if (consent) {
    await addDoc(collection(db, "requestListings"), {
        blood: blood,
        hospital: hospital,
        status: "Pending",
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp()
    });
}

        message.textContent = "Donor request submitted successfully!";

        this.reset();

    } catch (error) {

        console.error("Request submission error:", error);
        message.textContent = "Could not submit request. Please try again.";

    }

});

// Display requests

            // Display donor requests from Firestore
async function displayRequests() {

    const output = document.getElementById("requestResults");

    output.innerHTML = "";

    if (!auth.currentUser) {
        output.textContent = "Please login first.";
        return;
    }

    try {

        const requestsQuery = query(
            collection(db, "requests"),
            where("userId", "==", auth.currentUser.uid)
        );

        const snapshot = await getDocs(requestsQuery);

        if (snapshot.empty) {
            output.textContent = "No requests submitted yet.";
            return;
        }

        snapshot.forEach(function(document) {

            const request = document.data();

            const card = document.createElement("div");
            card.className = "request-card";

            const details = document.createElement("p");

            details.textContent =
                "Patient: " + request.patient +
                " | Blood: " + request.blood +
                " | Location: " + request.hospital +
                " | Status: " + request.status;

            card.appendChild(details);
            output.appendChild(card);

        });

    } catch (error) {

        console.error("Display requests error:", error);
        output.textContent = "Could not load requests.";

    }
}

// Update request status
function updateRequest(index, status) {

    requests[index].status = status;

    displayRequests();

}
// Signup functionality
document.getElementById("signupForm")
.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const message = document.getElementById("authMessage");

    try {
        await createUserWithEmailAndPassword(auth, email, password);

        message.textContent = "Account created successfully!";

        this.reset();
        await displayRequests();

    } catch (error) {
        message.textContent = error.message;
    }
});

// Login functionality
document.getElementById("loginForm")
.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("authMessage");

    try {
        await signInWithEmailAndPassword(auth, email, password);

        message.textContent = "Login successful!";

        this.reset();

    } catch (error) {
        message.textContent = error.message;
    }
});


// Logout functionality
document.getElementById("logoutButton")
.addEventListener("click", async function() {

    try {
        await signOut(auth);
        document.getElementById("authMessage").textContent =
            "Logged out successfully!";

    } catch (error) {
        document.getElementById("authMessage").textContent =
            error.message;
    }
});

// Monitor login status
onAuthStateChanged(auth, function(user) {

    const logoutButton = document.getElementById("logoutButton");

    logoutButton.hidden = !user;
});
// Display shared blood requests
async function displaySharedRequests() {

    const output = document.getElementById("sharedRequestResults");
    output.innerHTML = "";

    if (!auth.currentUser) {
        output.textContent = "Please login first.";
        return;
    }

    try {
        const snapshot = await getDocs(
            collection(db, "requestListings")
        );
        console.log("Shared requests found:", snapshot.size);

        if (snapshot.empty) {
            output.textContent = "No shared requests available.";
            return;
        }

       snapshot.forEach(function(requestDoc) {

    const request = requestDoc.data();

            const card = document.createElement("div");
            card.className = "request-card";

            const details = document.createElement("p");

            details.textContent =
                "Blood Group: " + request.blood +
                " | Hospital/Location: " + request.hospital +
                " | Status: " + request.status;

            card.appendChild(details);

if (request.userId !== auth.currentUser.uid) {

    const offerButton = document.createElement("button");

    offerButton.textContent = "Offer to Donate";

    offerButton.onclick = async function() {

        try {
            await addDoc(collection(db, "requestResponses"), {
                requestId: requestDoc.id,
                donorId: auth.currentUser.uid,
                status: "Offered",
                createdAt: serverTimestamp()
            });

            offerButton.textContent = "Offer Sent!";
            offerButton.disabled = true;

        } catch (error) {
            console.error(error);
            alert("Could not send your offer.");
        }
    };

    card.appendChild(offerButton);
}

output.appendChild(card);
        });

    } catch (error) {
        console.error("Shared requests error:", error);
        output.textContent = "Could not load shared requests.";
    }
}
window.findDonors = findDonors;
window.displaySharedRequests = displaySharedRequests;
