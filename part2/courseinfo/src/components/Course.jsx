const CourseHeader = (props) => <h2>{props.course}</h2>

const Content = ({ parts }) => {
  return (
    <>
      {parts.map(part => <Part key={part.id} part={part} />)}
    </>
  )
}

const Part = ({ part }) => (
  <p>
    {part.name} {part.exercises}
  </p>
)

const Total = ({ total }) => <p><b>total of {total} exercises</b></p>

const Course = ({ course }) => {
  return (
    <>
      <CourseHeader course={course.name} />
      <Content parts={course.parts} />
      <Total total={course.parts.reduce((sum, part) => sum + part.exercises, 0)} />
    </>
  )
}

export default Course