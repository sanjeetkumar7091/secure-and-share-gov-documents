// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyBQNp5IH77FdxBJMC9Ibpgd2XqoQfKRtzI",
  authDomain: "gov-documents-1083e.firebaseapp.com",
  projectId: "gov-documents-1083e",
  storageBucket: "gov-documents-1083e.firebasestorage.app",
  messagingSenderId: "859742964031",
  appId: "1:859742964031:web:b1802c8bd298bea981eb8a",
  measurementId: "G-NXZMY1T9SY"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let confirmationResult = null;
let currentUser = null;

// UI Elements
const registerSection = document.getElementById('register-section');
const otpSection = document.getElementById('otp-section');
const loginSection = document.getElementById('login-section');
const docManagementSection = document.getElementById('doc-management');
const shareDocSection = document.getElementById('share-doc-section');
const profileSection = document.getElementById('profile-section');

const registerEmailInput = document.getElementById('register-email');
const registerPhoneInput = document.getElementById('register-phone');
const registerBtn = document.getElementById('register-btn');

const otpCodeInput = document.getElementById('otp-code');
const verifyOtpBtn = document.getElementById('verify-otp-btn');

const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');

const docUploadInput = document.getElementById('doc-upload');
const uploadDocBtn = document.getElementById('upload-doc-btn');
const docList = document.getElementById('doc-list');

const docToShareSelect = document.getElementById('doc-to-share');
const shareWithEmailInput = document.getElementById('share-with-email');
const shareDocBtn = document.getElementById('share-doc-btn');

const profileEmail = document.getElementById('profile-email');
const logoutBtn = document.getElementById('logout-btn');

// Initialize Recaptcha verifier for OTP
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('register-btn', {
    'size': 'invisible',
    'callback': (response) => {
        // reCAPTCHA solved, allow register
        registerUser();
    }
});

registerBtn.addEventListener('click', () => {
    registerUser();
});

verifyOtpBtn.addEventListener('click', () => {
    verifyOtp();
});

loginBtn.addEventListener('click', () => {
    loginUser();
});

uploadDocBtn.addEventListener('click', () => {
    uploadDocument();
});

shareDocBtn.addEventListener('click', () => {
    shareDocument();
});

logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        resetUI();
    });
});

function registerUser() {
    const email = registerEmailInput.value;
    const phone = registerPhoneInput.value;

    if (!email || !phone) {
        alert('Please enter email and phone number.');
        return;
    }

    // Send OTP to phone number
    const appVerifier = window.recaptchaVerifier;
    auth.signInWithPhoneNumber(phone, appVerifier)
        .then((result) => {
            confirmationResult = result;
            alert('OTP sent to your phone.');
            registerSection.style.display = 'none';
            otpSection.style.display = 'block';
        })
        .catch((error) => {
            console.error(error);
            alert('Error sending OTP: ' + error.message);
        });
}

function verifyOtp() {
    const code = otpCodeInput.value;
    if (!code) {
        alert('Please enter the OTP code.');
        return;
    }
    confirmationResult.confirm(code)
        .then((result) => {
            currentUser = result.user;
            alert('Phone number verified. Registration complete.');
            otpSection.style.display = 'none';
            loginSection.style.display = 'block';
        })
        .catch((error) => {
            console.error(error);
            alert('Invalid OTP code.');
        });
}

function loginUser() {
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    if (!email || !password) {
        alert('Please enter email and password.');
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            alert('Login successful.');
            loginSection.style.display = 'none';
            showAppForUser();
        })
        .catch((error) => {
            console.error(error);
            alert('Login failed: ' + error.message);
        });
}

function showAppForUser() {
    profileEmail.textContent = 'Logged in as: ' + currentUser.email;
    docManagementSection.style.display = 'block';
    shareDocSection.style.display = 'block';
    profileSection.style.display = 'block';
    loadUserDocuments();
}

function resetUI() {
    currentUser = null;
    registerSection.style.display = 'block';
    otpSection.style.display = 'none';
    loginSection.style.display = 'block';
    docManagementSection.style.display = 'none';
    shareDocSection.style.display = 'none';
    profileSection.style.display = 'none';
    docList.innerHTML = '';
    docToShareSelect.innerHTML = '';
    registerEmailInput.value = '';
    registerPhoneInput.value = '';
    otpCodeInput.value = '';
    loginEmailInput.value = '';
    loginPasswordInput.value = '';
    shareWithEmailInput.value = '';
}

function uploadDocument() {
    const file = docUploadInput.files[0];
    if (!file) {
        alert('Please select a document to upload.');
        return;
    }
    const storageRef = storage.ref();
    const userDocsRef = storageRef.child('documents/' + currentUser.uid + '/' + file.name);
    userDocsRef.put(file).then(snapshot => {
        snapshot.ref.getDownloadURL().then(url => {
            db.collection('documents').add({
                ownerId: currentUser.uid,
                fileName: file.name,
                fileUrl: url,
                sharedWith: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                alert('Document uploaded successfully.');
                loadUserDocuments();
            });
        });
    }).catch(error => {
        console.error(error);
        alert('Upload failed: ' + error.message);
    });
}

function loadUserDocuments() {
    docList.innerHTML = '';
    docToShareSelect.innerHTML = '';
    db.collection('documents')
        .where('ownerId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const data = doc.data();
                const li = document.createElement('li');
                li.textContent = data.fileName;

                const actionsDiv = document.createElement('div');
                actionsDiv.classList.add('doc-actions');

                const downloadBtn = document.createElement('button');
                downloadBtn.textContent = 'Download';
                downloadBtn.addEventListener('click', () => {
                    window.open(data.fileUrl, '_blank');
                });

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.classList.add('delete-btn');
                deleteBtn.addEventListener('click', () => {
                    deleteDocument(doc.id, data.fileName);
                });

                const shareBtn = document.createElement('button');
                shareBtn.textContent = 'Share';
                shareBtn.classList.add('share-btn');
                shareBtn.addEventListener('click', () => {
                    docToShareSelect.value = doc.id;
                });

                actionsDiv.appendChild(downloadBtn);
                actionsDiv.appendChild(deleteBtn);
                actionsDiv.appendChild(shareBtn);

                li.appendChild(actionsDiv);
                docList.appendChild(li);

                // Add to share dropdown
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = data.fileName;
                docToShareSelect.appendChild(option);
            });
        });
}

function deleteDocument(docId, fileName) {
    if (!confirm('Are you sure you want to delete "' + fileName + '"?')) {
        return;
    }
    db.collection('documents').doc(docId).delete()
        .then(() => {
            alert('Document deleted.');
            loadUserDocuments();
        })
        .catch(error => {
            console.error(error);
            alert('Delete failed: ' + error.message);
        });
}

function shareDocument() {
    const docId = docToShareSelect.value;
    const shareEmail = shareWithEmailInput.value.trim();
    if (!docId || !shareEmail) {
        alert('Please select a document and enter an email to share with.');
        return;
    }
    // Find user by email to get their uid
    db.collection('users').where('email', '==', shareEmail).get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                alert('User with this email not found.');
                return;
            }
            const userToShare = querySnapshot.docs[0];
            const userIdToShare = userToShare.id;
            // Update document sharedWith array
            const docRef = db.collection('documents').doc(docId);
            docRef.update({
                sharedWith: firebase.firestore.FieldValue.arrayUnion(userIdToShare)
            }).then(() => {
                alert('Document shared successfully.');
                shareWithEmailInput.value = '';
            });
        })
        .catch(error => {
            console.error(error);
            alert('Error sharing document: ' + error.message);
        });
}

// Monitor auth state
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        showAppForUser();
    } else {
        resetUI();
    }
});
