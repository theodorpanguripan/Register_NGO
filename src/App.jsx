import { useState } from 'react'

const API_URL = 'https://udnh87tari.execute-api.ap-southeast-1.amazonaws.com/Dev/v2/account/register-ngo'
const API_KEY = import.meta.env.VITE_API_KEY || ''

const initialFormState = {
  firstName: '',
  lastName: '',
  ngoName: '',
  ngoPrefix: '',
  description: '',
  businessRegistrationNumber: '',
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  city: '',
  country: '',
  zipCode: '',
  subscribe: false,
  website: '',
  state: '',
  street: '',
}

function App() {
  const [formData, setFormData] = useState(initialFormState)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.ngoName.trim()) newErrors.ngoName = 'NGO name is required'
    if (!formData.ngoPrefix.trim()) newErrors.ngoPrefix = 'NGO prefix is required'
    if (!formData.businessRegistrationNumber.trim())
      newErrors.businessRegistrationNumber = 'Business registration number is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'
    if (formData.website && formData.website.trim() && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL (e.g. https://example.org)'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const buildPayload = () => {
    const { street, city, state, zipCode, country, phoneNumber, ...rest } = formData
    return {
      ...rest,
      phoneNumber: phoneNumber ? `+852${phoneNumber.replace(/\D/g, '')}` : '',
      address: {
        street: street || '',
        city: city || '',
        state: state || '',
        zipCode: zipCode || '',
        country,
      },
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const payload = buildPayload()
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (response.status !== 200 && response.status !== 201) {
        const errorMessage = data.error || data.message || data.errorMessage || data.body?.error || `Registration failed (${response.status})`
        throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
      }
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormState)
    setErrors({})
    setSubmitted(false)
    setSubmitError(null)
  }

  if (submitted) {
    return (
      <div className="success-page">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Registration Submitted</h1>
          <p>Thank you for registering. Your NGO account has been created successfully.</p>
          <pre className="submitted-data">{JSON.stringify(buildPayload(), null, 2)}</pre>
          <button type="button" onClick={resetForm} className="btn btn-secondary">
            Register Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="form-container">
        <header className="form-header">
          <h1>NGO Registration</h1>
          <p>Create your organization account to get started</p>
        </header>

        <form onSubmit={handleSubmit} className="registration-form">
          <section className="form-section">
            <h2>Personal Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Organization Details</h2>
            <div className="form-group">
              <label htmlFor="ngoName">NGO Name *</label>
              <input
                id="ngoName"
                name="ngoName"
                type="text"
                value={formData.ngoName}
                onChange={handleChange}
                placeholder="Your Organization Name"
                className={errors.ngoName ? 'error' : ''}
              />
              {errors.ngoName && <span className="error-msg">{errors.ngoName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="ngoPrefix">NGO Prefix *</label>
              <input
                id="ngoPrefix"
                name="ngoPrefix"
                type="text"
                value={formData.ngoPrefix}
                onChange={handleChange}
                placeholder="e.g. NGO-001"
                className={errors.ngoPrefix ? 'error' : ''}
              />
              {errors.ngoPrefix && <span className="error-msg">{errors.ngoPrefix}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of your organization and its mission..."
                rows={4}
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-msg">{errors.description}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="businessRegistrationNumber">Business Registration Number *</label>
              <input
                id="businessRegistrationNumber"
                name="businessRegistrationNumber"
                type="text"
                value={formData.businessRegistrationNumber}
                onChange={handleChange}
                placeholder="e.g. 123456789"
                className={errors.businessRegistrationNumber ? 'error' : ''}
              />
              {errors.businessRegistrationNumber && (
                <span className="error-msg">{errors.businessRegistrationNumber}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.org"
                className={errors.website ? 'error' : ''}
              />
              {errors.website && <span className="error-msg">{errors.website}</span>}
            </div>
          </section>

          <section className="form-section">
            <h2>Account Credentials</h2>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.org"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-msg">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <div className="input-with-prefix">
                <span className="input-prefix">+852</span>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="91234567"
                  className={errors.phoneNumber ? 'error' : ''}
                />
              </div>
              {errors.phoneNumber && <span className="error-msg">{errors.phoneNumber}</span>}
            </div>
          </section>

          <section className="form-section">
            <h2>Address</h2>
            <div className="form-group">
              <label htmlFor="street">Street Address</label>
              <input
                id="street"
                name="street"
                type="text"
                value={formData.street}
                onChange={handleChange}
                placeholder="123 Main Street"
                className={errors.street ? 'error' : ''}
              />
              {errors.street && <span className="error-msg">{errors.street}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                placeholder="Los Angeles"
                className={errors.city ? 'error' : ''}
              />
              {errors.city && <span className="error-msg">{errors.city}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="state">State / Province</label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="California"
                  className={errors.state ? 'error' : ''}
                />
                {errors.state && <span className="error-msg">{errors.state}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="zipCode">Zip Code</label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="90210"
                  className={errors.zipCode ? 'error' : ''}
                />
                {errors.zipCode && <span className="error-msg">{errors.zipCode}</span>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <input
                id="country"
                name="country"
                type="text"
                value={formData.country}
                onChange={handleChange}
                placeholder="United States"
                className={errors.country ? 'error' : ''}
              />
              {errors.country && <span className="error-msg">{errors.country}</span>}
            </div>
          </section>

          <section className="form-section">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  id="subscribe"
                  name="subscribe"
                  type="checkbox"
                  checked={formData.subscribe}
                  onChange={handleChange}
                />
                <span className="checkmark">Subscribe to newsletter and updates</span>
              </label>
            </div>
          </section>

          {submitError && (
            <div className="submit-error">
              {submitError}
            </div>
          )}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
            <button type="button" onClick={resetForm} className="btn btn-outline">
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default App
