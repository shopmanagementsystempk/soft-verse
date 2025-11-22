import { useRef, useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import SuccessModal from '../components/shared/SuccessModal';

const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

const uploadCvToCloudinary = async (file) => {
  if (!file) return '';
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    // eslint-disable-next-line no-console
    console.warn('Cloudinary configuration missing. Skipping CV upload.');
    return '';
  }

  try {
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
    const payload = new FormData();
    payload.append('file', file);
    payload.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    payload.append('folder', 'softverse/applications');

    const response = await fetch(endpoint, {
      method: 'POST',
      body: payload,
    });

    if (!response.ok) {
      const errorText = await response.text();
      // eslint-disable-next-line no-console
      console.error('Cloudinary upload failed:', errorText);
      return '';
    }

    const data = await response.json();
    return data.secure_url || '';
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Cloudinary upload error:', err);
    return '';
  }
};

const skillOptions = [
  'React',
  'Node.js',
  'TypeScript',
  'UI/UX',
  'Product Design',
  'Project Management',
  'QA Automation',
  'DevOps',
  'Data Engineering',
  'Cloud',
  'Marketing Automation',
];

const positionOptions = [
  // 'Frontend Engineer',
  // 'Backend Engineer',
  // 'Full Stack Engineer',
  // 'Product Designer',
  // 'QA Analyst',
  // 'Project Manager',
  // 'DevOps Engineer',
  'Marketing',
];

const availabilityOptions = ['Immediate', '2 Weeks Notice', '1 Month Notice', 'Other'];
const jobTypeOptions = ['Remote', 'On-site', 'Hybrid'];

const defaultState = {
  fullName: '',
  fatherName: '',
  email: '',
  phone: '',
  whatsapp: '',
  cnic: '',
  dob: '',
  gender: '',
  city: '',
  address: '',
  educationDegree: '',
  educationInstitute: '',
  educationYear: '',
  skills: [],
  experienceYears: '',
  previousCompany: '',
  role: '',
  responsibilities: '',
  cvFile: null,
  portfolioLink: '',
  githubLink: '',
  linkedinLink: '',
  position: '',
  expectedSalary: '',
  availability: '',
  shortBio: '',
  jobType: '',
};

const Apply = () => {
  const [formData, setFormData] = useState(defaultState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0] || null;
    if (!file) {
      setFormData((prev) => ({
        ...prev,
        cvFile: null,
      }));
      setErrors((prev) => ({ ...prev, cvFile: 'Upload your CV/Resume' }));
      return;
    }

    // Enforce image-only uploads
    if (!file.type || !file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        cvFile: 'Please upload an image file (JPG, JPEG, PNG, GIF)',
      }));
      // Clear invalid selection
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFormData((prev) => ({
        ...prev,
        cvFile: null,
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, cvFile: '' }));
    setFormData((prev) => ({
      ...prev,
      cvFile: file,
    }));
  };

  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const isSelected = prev.skills.includes(skill);
      return {
        ...prev,
        skills: isSelected ? prev.skills.filter((item) => item !== skill) : [...prev.skills, skill],
      };
    });
  };

  const validate = () => {
    const validationErrors = {};
    const requiredFields = [
      'fullName',
      'fatherName',
      'email',
      'phone',
      'cnic',
      'dob',
      'gender',
      'city',
      'address',
      'educationDegree',
      'educationInstitute',
      'educationYear',
      'experienceYears',
      'role',
      'responsibilities',
      'position',
      'expectedSalary',
      'availability',
      'shortBio',
      'jobType',
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        validationErrors[field] = 'This field is required';
      }
    });

    if (!formData.skills.length) {
      validationErrors.skills = 'Select at least one skill';
    }

    if (!formData.cvFile) {
      validationErrors.cvFile = 'Upload your CV/Resume';
    }

    // Ensure the selected file is an image
    if (formData.cvFile && (!formData.cvFile.type || !formData.cvFile.type.startsWith('image/'))) {
      validationErrors.cvFile = 'Please upload an image file (JPG, JPEG, PNG, GIF)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.email = 'Enter a valid email';
    }

    if (formData.phone && formData.phone.length < 10) {
      validationErrors.phone = 'Enter a valid phone number';
    }

    if (formData.whatsapp && formData.whatsapp.length < 10) {
      validationErrors.whatsapp = 'Enter a valid WhatsApp number';
    }

    return validationErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload CV image if provided
      const cvUrl = await uploadCvToCloudinary(formData.cvFile);

      const payload = {
        ...formData,
        cvUrl,
        status: 'new',
      };
      // Remove file object before save
      delete payload.cvFile;

      await addDoc(collection(db, 'applications'), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setShowSuccess(true);
      setFormData(defaultState);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setSubmitError(error.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <h1 className="fw-bold mb-4">Apply Now</h1>
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Full Name</label>
              <input type="text" className="form-control" name="fullName" value={formData.fullName} onChange={handleInputChange} />
              {errors.fullName && <small className="text-danger">{errors.fullName}</small>}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Father Name</label>
              <input type="text" className="form-control" name="fatherName" value={formData.fatherName} onChange={handleInputChange} />
              {errors.fatherName && <small className="text-danger">{errors.fatherName}</small>}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Email</label>
              <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} />
              {errors.email && <small className="text-danger">{errors.email}</small>}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Phone</label>
              <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleInputChange} />
              {errors.phone && <small className="text-danger">{errors.phone}</small>}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">WhatsApp</label>
              <input type="tel" className="form-control" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} />
              {errors.whatsapp && <small className="text-danger">{errors.whatsapp}</small>}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">CNIC</label>
              <input type="text" className="form-control" name="cnic" value={formData.cnic} onChange={handleInputChange} />
              {errors.cnic && <small className="text-danger">{errors.cnic}</small>}
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Date of Birth</label>
              <input type="date" className="form-control" name="dob" value={formData.dob} onChange={handleInputChange} />
              {errors.dob && <small className="text-danger">{errors.dob}</small>}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Gender</label>
              <select className="form-select" name="gender" value={formData.gender} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <small className="text-danger">{errors.gender}</small>}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">City</label>
              <input type="text" className="form-control" name="city" value={formData.city} onChange={handleInputChange} />
              {errors.city && <small className="text-danger">{errors.city}</small>}
            </div>

            <div className="col-md-12">
              <label className="form-label fw-semibold">Address</label>
              <input type="text" className="form-control" name="address" value={formData.address} onChange={handleInputChange} />
              {errors.address && <small className="text-danger">{errors.address}</small>}
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Education Degree</label>
              <input type="text" className="form-control" name="educationDegree" value={formData.educationDegree} onChange={handleInputChange} />
              {errors.educationDegree && <small className="text-danger">{errors.educationDegree}</small>}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Institute</label>
              <input type="text" className="form-control" name="educationInstitute" value={formData.educationInstitute} onChange={handleInputChange} />
              {errors.educationInstitute && <small className="text-danger">{errors.educationInstitute}</small>}
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Year</label>
              <input type="text" className="form-control" name="educationYear" value={formData.educationYear} onChange={handleInputChange} />
              {errors.educationYear && <small className="text-danger">{errors.educationYear}</small>}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Skills</label>
              <div className="d-flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <button
                    type="button"
                    key={skill}
                    className={`btn btn-sm ${formData.skills.includes(skill) ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {errors.skills && <small className="text-danger d-block mt-1">{errors.skills}</small>}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Experience (years)</label>
              <input type="number" className="form-control" name="experienceYears" value={formData.experienceYears} onChange={handleInputChange} />
              {errors.experienceYears && <small className="text-danger">{errors.experienceYears}</small>}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Previous Company</label>
              <input type="text" className="form-control" name="previousCompany" value={formData.previousCompany} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Role</label>
              <input type="text" className="form-control" name="role" value={formData.role} onChange={handleInputChange} />
              {errors.role && <small className="text-danger">{errors.role}</small>}
            </div>

            <div className="col-md-12">
              <label className="form-label fw-semibold">Responsibilities</label>
              <textarea className="form-control" rows="3" name="responsibilities" value={formData.responsibilities} onChange={handleInputChange} />
              {errors.responsibilities && <small className="text-danger">{errors.responsibilities}</small>}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Portfolio Link</label>
              <input type="url" className="form-control" name="portfolioLink" value={formData.portfolioLink} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">GitHub</label>
              <input type="url" className="form-control" name="githubLink" value={formData.githubLink} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">LinkedIn</label>
              <input type="url" className="form-control" name="linkedinLink" value={formData.linkedinLink} onChange={handleInputChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Position</label>
              <select className="form-select" name="position" value={formData.position} onChange={handleInputChange}>
                <option value="">Select position</option>
                {positionOptions.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
              {errors.position && <small className="text-danger">{errors.position}</small>}
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Expected Salary</label>
              <input type="text" className="form-control" name="expectedSalary" value={formData.expectedSalary} onChange={handleInputChange} />
              {errors.expectedSalary && <small className="text-danger">{errors.expectedSalary}</small>}
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Availability</label>
              <select className="form-select" name="availability" value={formData.availability} onChange={handleInputChange}>
                <option value="">Select</option>
                {availabilityOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.availability && <small className="text-danger">{errors.availability}</small>}
            </div>

            <div className="col-md-12">
              <label className="form-label fw-semibold">Short Bio</label>
              <textarea className="form-control" rows="4" name="shortBio" value={formData.shortBio} onChange={handleInputChange} />
              {errors.shortBio && <small className="text-danger">{errors.shortBio}</small>}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Preferred job type</label>
              <select className="form-select" name="jobType" value={formData.jobType} onChange={handleInputChange}>
                <option value="">Select</option>
                {jobTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.jobType && <small className="text-danger">{errors.jobType}</small>}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Upload CV/Resume (Image file)</label>
              <input ref={fileInputRef} type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
              {errors.cvFile && <small className="text-danger">{errors.cvFile}</small>}
            </div>

            {submitError && (
              <div className="col-12">
                <div className="alert alert-danger">{submitError}</div>
              </div>
            )}

            <div className="col-12 d-flex justify-content-end">
              <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <SuccessModal
        show={showSuccess}
        title="Application Submitted"
        message="Thank you! Your application has been submitted. Our team will get back to you soon."
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default Apply;