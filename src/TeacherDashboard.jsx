import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './supabase'
import { Icons } from './Icons'
import Layout from './Layout'

const PAGE_ROUTES = {
  overview: '/dashboard',
  classes: '/dashboard/classes',
  exams: '/dashboard/exams',
  questions: '/dashboard/questions',
}

export default function TeacherDashboard({ profile, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()

  const getPage = () => {
    const p = location.pathname
    if (p.includes('classes')) return 'classes'
    if (p.includes('questions')) return 'questions'
    if (p.includes('exams')) return 'exams'
    return 'overview'
  }

  const page = getPage()
  const setPage = (p) => navigate(PAGE_ROUTES[p] || '/dashboard')

  const [classes, setClasses] = useState([])
  const [exams, setExams] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  const [showExamModal, setShowExamModal] = useState(false)
  const [examForm, setExamForm] = useState({ title: '', classId: '', scheduledAt: '' })
  const [savingExam, setSavingExam] = useState(false)

  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [qForm, setQForm] = useState({ examId: '', body: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'a', marks: '1' })
  const [savingQ, setSavingQ] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: cls }, { data: ex }, { data: qs }] = await Promise.all([
      supabase.from('class_teachers').select('classes(id, name)').eq('teacher_id', profile.id),
      supabase.from('exams').select('id, title, scheduledAt:scheduled_at, classes(name), subjects(name)').eq('created_by', profile.id).order('scheduled_at', { ascending: true }),
      supabase.from('questions').select('id, body, option_a, option_b, option_c, option_d, correct_option, marks, exams(title)').order('created_at', { ascending: false }),
    ])
    if (cls) setClasses(cls.map(c => c.classes).filter(Boolean))
    if (ex) setExams(ex)
    if (qs) setQuestions(qs)
    setLoading(false)
  }

  const handleAddExam = async (e) => {
    e.preventDefault()
    setSavingExam(true)
    await supabase.from('exams').insert({
      title: examForm.title,
      class_id: examForm.classId || null,
      scheduled_at: examForm.scheduledAt || null,
      created_by: profile.id,
    })
    setShowExamModal(false)
    setExamForm({ title: '', classId: '', scheduledAt: '' })
    setSavingExam(false)
    fetchData()
  }

  const handleAddQuestion = async (e) => {
    e.preventDefault()
    setSavingQ(true)
    await supabase.from('questions').insert({
      exam_id: qForm.examId,
      body: qForm.body,
      option_a: qForm.optionA,
      option_b: qForm.optionB,
      option_c: qForm.optionC,
      option_d: qForm.optionD,
      correct_option: qForm.correctOption,
      marks: parseFloat(qForm.marks) || 1,
    })
    setShowQuestionModal(false)
    setQForm({ examId: '', body: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'a', marks: '1' })
    setSavingQ(false)
    fetchData()
  }

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return
    await supabase.from('questions').delete().eq('id', id)
    fetchData()
  }

  const navItems = [
    { key: 'overview', label: 'Overview', icon: Icons.overview, active: page === 'overview', onClick: () => setPage('overview') },
    { key: 'classes', label: 'My Classes', icon: Icons.classes, active: page === 'classes', onClick: () => setPage('classes') },
    {
      key: 'examsGroup', label: 'Exams', icon: Icons.exams,
      active: page === 'exams' || page === 'questions',
      onClick: () => setPage('exams'),
      children: [
        { key: 'exams', label: 'All Exams', active: page === 'exams', onClick: () => setPage('exams') },
        { key: 'questions', label: 'Questions', active: page === 'questions', onClick: () => setPage('questions') },
      ],
    },
  ]

  return (
    <Layout profile={profile} onLogout={onLogout} navItems={navItems}>
      <p className="pageTitle">
        {page === 'overview' ? `Welcome, ${profile.full_name || profile.username}` : { classes: 'My Classes', exams: 'Exams', questions: 'Questions' }[page]}
      </p>

      {loading ? <div className="pageLoader"><div className="pageLoaderSpinner" /></div> : (
        <>
          {page === 'overview' && (
            <>
              <div className="statsRow">
                <div className="statCard"><p className="statLabel">Classes</p><p className="statValue">{classes.length}</p></div>
                <div className="statCard"><p className="statLabel">Exams</p><p className="statValue">{exams.length}</p></div>
                <div className="statCard"><p className="statLabel">Questions</p><p className="statValue">{questions.length}</p></div>
              </div>
              <div className="card">
                <p className="cardTitle">Upcoming Exams</p>
                <div className="tableWrap"><table>
                  <thead><tr><th>Title</th><th>Class</th><th>Scheduled</th></tr></thead>
                  <tbody>
                    {exams.length === 0 && <tr><td colSpan={3} className="emptyRow">No exams yet.</td></tr>}
                    {exams.slice(0, 5).map(e => (
                      <tr key={e.id}><td>{e.title}</td><td>{e.classes?.name || '—'}</td><td>{e.scheduledAt ? new Date(e.scheduledAt).toLocaleDateString() : '—'}</td></tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            </>
          )}

          {page === 'classes' && (
            <div className="card">
              <p className="cardTitle">My Classes</p>
              <div className="tableWrap"><table>
                <thead><tr><th>Class Name</th></tr></thead>
                <tbody>
                  {classes.length === 0 && <tr><td className="emptyRow">No classes assigned.</td></tr>}
                  {classes.map(c => <tr key={c.id}><td>{c.name}</td></tr>)}
                </tbody>
              </table></div>
            </div>
          )}

          {page === 'exams' && (
            <div className="card">
              <div className="cardHeader">
                <p className="cardTitle">Exams</p>
                <button className="btn btnPrimary" onClick={() => { setExamForm({ title: '', classId: '', scheduledAt: '' }); setShowExamModal(true) }}>+ Add Exam</button>
              </div>
              <div className="tableWrap"><table>
                <thead><tr><th>Title</th><th>Class</th><th>Subject</th><th>Scheduled</th></tr></thead>
                <tbody>
                  {exams.length === 0 && <tr><td colSpan={4} className="emptyRow">No exams yet.</td></tr>}
                  {exams.map(e => (
                    <tr key={e.id}>
                      <td>{e.title}</td><td>{e.classes?.name || '—'}</td><td>{e.subjects?.name || '—'}</td>
                      <td>{e.scheduledAt ? new Date(e.scheduledAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          )}

          {page === 'questions' && (
            <div className="card">
              <div className="cardHeader">
                <p className="cardTitle">Questions</p>
                <button className="btn btnPrimary" onClick={() => { setQForm({ examId: exams[0]?.id || '', body: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'a', marks: '1' }); setShowQuestionModal(true) }}>+ Add Question</button>
              </div>
              <div className="tableWrap"><table>
                <thead><tr><th>Question</th><th>Exam</th><th>Correct</th><th>Marks</th><th></th></tr></thead>
                <tbody>
                  {questions.length === 0 && <tr><td colSpan={5} className="emptyRow">No questions yet.</td></tr>}
                  {questions.map(q => (
                    <tr key={q.id}>
                      <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.body}</td>
                      <td>{q.exams?.title || '—'}</td>
                      <td><span className="badge">{q.correct_option?.toUpperCase()}</span></td>
                      <td>{q.marks}</td>
                      <td><button className="btn btnDanger" onClick={() => handleDeleteQuestion(q.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          )}
        </>
      )}

      {showExamModal && (
        <div className="modalOverlay" onClick={() => setShowExamModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Exam</h2>
            <form onSubmit={handleAddExam}>
              <div className="field"><label>Title</label>
                <input value={examForm.title} onChange={e => setExamForm({ ...examForm, title: e.target.value })} placeholder="e.g. Midterm Exam" required />
              </div>
              <div className="field"><label>Class</label>
                <select value={examForm.classId} onChange={e => setExamForm({ ...examForm, classId: e.target.value })}>
                  <option value="">— None —</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field"><label>Scheduled Date</label>
                <input type="date" value={examForm.scheduledAt} onChange={e => setExamForm({ ...examForm, scheduledAt: e.target.value })} />
              </div>
              <div className="modalActions">
                <button type="button" className="btn btnSecondary" onClick={() => setShowExamModal(false)}>Cancel</button>
                <button type="submit" className="btn btnPrimary" disabled={savingExam}>
                  {savingExam && <span className="loader" />}{savingExam ? 'Saving…' : 'Add Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQuestionModal && (
        <div className="modalOverlay" onClick={() => setShowQuestionModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Question</h2>
            <form onSubmit={handleAddQuestion}>
              <div className="field"><label>Exam</label>
                <select value={qForm.examId} onChange={e => setQForm({ ...qForm, examId: e.target.value })} required>
                  <option value="">— Select Exam —</option>
                  {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                </select>
              </div>
              <div className="field"><label>Question</label>
                <textarea value={qForm.body} onChange={e => setQForm({ ...qForm, body: e.target.value })} rows={3} placeholder="Enter question text" required />
              </div>
              {['A', 'B', 'C', 'D'].map(opt => (
                <div className="field" key={opt}><label>Option {opt}</label>
                  <input value={qForm[`option${opt}`]} onChange={e => setQForm({ ...qForm, [`option${opt}`]: e.target.value })} placeholder={`Option ${opt}`} />
                </div>
              ))}
              <div className="field"><label>Correct Option</label>
                <select value={qForm.correctOption} onChange={e => setQForm({ ...qForm, correctOption: e.target.value })}>
                  {['a', 'b', 'c', 'd'].map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="field"><label>Marks</label>
                <input type="number" value={qForm.marks} onChange={e => setQForm({ ...qForm, marks: e.target.value })} min="0.5" step="0.5" />
              </div>
              <div className="modalActions">
                <button type="button" className="btn btnSecondary" onClick={() => setShowQuestionModal(false)}>Cancel</button>
                <button type="submit" className="btn btnPrimary" disabled={savingQ}>
                  {savingQ && <span className="loader" />}{savingQ ? 'Saving…' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
