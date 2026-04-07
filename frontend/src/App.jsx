import { useEffect, useState } from 'react'
import heroImg from './assets/hero.png'
import './App.css'

const RESOURCE_TYPES = ['', 'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']
const RESOURCE_STATUSES = ['', 'ACTIVE', 'OUT_OF_SERVICE']
const initialResourceForm = {
  name: '',
  type: 'LECTURE_HALL',
  capacity: 1,
  location: '',
  availability: 'Mon-Fri 08:00-18:00',
  status: 'ACTIVE',
  description: '',
}

function App() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [location, setLocation] = useState('')
  const [minCapacity, setMinCapacity] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [roles, setRoles] = useState([])
  const [authError, setAuthError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [resourceForm, setResourceForm] = useState(initialResourceForm)

  const apiUrl = 'http://localhost:8080/api'
  const authHeader = authenticated ? `Basic ${window.btoa(`${username}:${password}`)}` : null
  const isAdmin = authenticated && roles.some((role) => role.includes('ADMIN'))

  useEffect(() => {
    loadResources()
  }, [])

  const buildQuery = () => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (status) params.set('status', status)
    if (location) params.set('location', location)
    if (minCapacity) params.set('minCapacity', minCapacity)
    return params.toString()
  }

  const requestOptions = (method = 'GET', body) => {
    const headers = {
      'Content-Type': 'application/json',
    }
    if (authHeader) {
      headers.Authorization = authHeader
    }
    const options = {
      method,
      headers,
    }
    if (body) {
      options.body = JSON.stringify(body)
    }
    return options
  }

  const loadResources = async () => {
    setLoading(true)
    setError('')
    setInfo('')

    try {
      const query = buildQuery()
      const response = await fetch(`${apiUrl}/resources${query ? `?${query}` : ''}`, requestOptions())
      if (!response.ok) {
        throw new Error(`Unable to load resources (${response.status})`)
      }
      const data = await response.json()
      setResources(data)
    } catch (fetchError) {
      setError(fetchError.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (event) => {
    event.preventDefault()
    loadResources()
  }

  const login = async (event) => {
    event.preventDefault()
    setAuthError('')
    setInfo('')

    if (!username || !password) {
      setAuthError('Username and password are required')
      return
    }

    try {
      const response = await fetch(`${apiUrl}/user`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${window.btoa(`${username}:${password}`)}`,
        },
      })
      if (!response.ok) {
        throw new Error('Invalid credentials')
      }
      const user = await response.json()
      setAuthenticated(true)
      setRoles(user.roles)
      setInfo(`Signed in as ${user.username}`)
      loadResources()
    } catch (err) {
      setAuthenticated(false)
      setRoles([])
      setAuthError('Login failed. Check your username and password.')
    }
  }

  const logout = () => {
    setAuthenticated(false)
    setRoles([])
    setInfo('Logged out')
    setAuthError('')
    setUsername('')
    setPassword('')
  }

  const handleCreateChange = (event) => {
    const { name, value } = event.target
    const parsedValue = name === 'capacity' ? Number(value) : value
    setResourceForm((prev) => ({ ...prev, [name]: parsedValue }))
  }

  const createResource = async (event) => {
    event.preventDefault()
    setError('')
    setInfo('')

    if (!isAdmin) {
      setError('Admin privileges are required to create resources.')
      return
    }

    try {
      const response = await fetch(`${apiUrl}/resources`, requestOptions('POST', resourceForm))
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.message || `Create failed (${response.status})`)
      }
      setResourceForm(initialResourceForm)
      setShowCreate(false)
      setInfo('Resource created successfully.')
      loadResources()
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteResource = async (id) => {
    if (!window.confirm('Delete this resource?')) {
      return
    }
    setError('')
    setInfo('')

    try {
      const response = await fetch(`${apiUrl}/resources/${id}`, requestOptions('DELETE'))
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.message || `Delete failed (${response.status})`)
      }
      setInfo('Resource deleted successfully.')
      loadResources()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <img src={heroImg} alt="Smart campus" />
          <div>
            <h1>Smart Campus Hub</h1>
            <p>Facilities catalogue and management</p>
          </div>
        </div>

        <div className="login-panel">
          {authenticated ? (
            <>
              <p>
                Signed in as <strong>{username}</strong>
              </p>
              <button type="button" className="counter" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <form className="login-form" onSubmit={login}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="counter" type="submit">
                Login
              </button>
            </form>
          )}
          {authError && <p className="error">{authError}</p>}
        </div>
      </header>

      <section id="center">
        <div>
          <h2>Browse resources</h2>
          <p>Filter the campus catalogue by type, location, capacity, and availability status.</p>
        </div>

        <form className="filter-form" onSubmit={handleSearch}>
          <label>
            Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {RESOURCE_TYPES.map((value) => (
                <option key={value} value={value}>
                  {value || 'All'}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {RESOURCE_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value || 'Any'}
                </option>
              ))}
            </select>
          </label>

          <label>
            Location
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City / building" />
          </label>

          <label>
            Min capacity
            <input
              type="number"
              min="1"
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
              placeholder="0"
            />
          </label>

          <button type="submit" className="counter">
            Search
          </button>
        </form>
      </section>

      {isAdmin && (
        <section className="admin-panel">
          <div className="admin-header">
            <h2>Admin controls</h2>
            <button type="button" className="counter" onClick={() => setShowCreate((prev) => !prev)}>
              {showCreate ? 'Hide create form' : 'Create new resource'}
            </button>
          </div>

          {showCreate && (
            <form className="resource-form" onSubmit={createResource}>
              <label>
                Name
                <input
                  name="name"
                  value={resourceForm.name}
                  onChange={handleCreateChange}
                  required
                />
              </label>

              <label>
                Type
                <select name="type" value={resourceForm.type} onChange={handleCreateChange}>
                  {RESOURCE_TYPES.filter(Boolean).map((value) => (
                    <option key={value} value={value}>
                      {value.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Capacity
                <input
                  name="capacity"
                  type="number"
                  min="1"
                  value={resourceForm.capacity}
                  onChange={handleCreateChange}
                  required
                />
              </label>

              <label>
                Location
                <input
                  name="location"
                  value={resourceForm.location}
                  onChange={handleCreateChange}
                  required
                />
              </label>

              <label>
                Availability
                <input
                  name="availability"
                  value={resourceForm.availability}
                  onChange={handleCreateChange}
                  required
                />
              </label>

              <label>
                Status
                <select name="status" value={resourceForm.status} onChange={handleCreateChange}>
                  {RESOURCE_STATUSES.filter(Boolean).map((value) => (
                    <option key={value} value={value}>
                      {value.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>

              <label className="full-width">
                Description
                <textarea
                  name="description"
                  value={resourceForm.description}
                  onChange={handleCreateChange}
                  rows="3"
                />
              </label>

              <button type="submit" className="counter">
                Save resource
              </button>
            </form>
          )}
        </section>
      )}

      <div className="ticks"></div>

      <section id="catalogue">
        <header className="catalogue-header">
          <h2>Resource catalogue</h2>
          <p>{loading ? 'Refreshing...' : `${resources.length} resources found`}</p>
        </header>

        {error && <div className="error">{error}</div>}
        {info && <div className="success">{info}</div>}

        <div className="resource-list">
          {resources.map((resource) => (
            <article key={resource.id} className="resource-card">
              <div className="resource-top">
                <div>
                  <h3>{resource.name}</h3>
                  <p className="resource-meta">
                    {resource.type.replace('_', ' ')} • {resource.capacity} capacity
                  </p>
                </div>
                <span className={`badge ${resource.status.toLowerCase()}`}>
                  {resource.status.replace('_', ' ')}
                </span>
              </div>
              <p>{resource.description || 'No description provided.'}</p>
              <div className="resource-details">
                <strong>Location:</strong> {resource.location}
              </div>
              <div className="resource-details">
                <strong>Availability:</strong> {resource.availability}
              </div>
              {isAdmin && (
                <div className="action-row">
                  <button type="button" className="danger" onClick={() => deleteResource(resource.id)}>
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </div>
  )
}

export default App
