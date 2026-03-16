import './AboutUsPage.css';
import { useNavigate } from "react-router-dom";

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div className="ab-wrap">
      <div className="ab-sky">
        <div className="cloud" />
        <div className="cloud slow" />
      </div>

      <section className="ab-card">
        <h1 className="ab-title">About</h1>
        <p className="ab-text">
          Heart Matrix is an arcade game inspired by classic road crossing fun.
          Move with the arrows, avoid traffic, and when you crash a puzzle pops up.
          Solve it to continue or quit to try again. Simple to play, hard to master.
        </p>

      </section>

      <div className="ab-ground" />
      <div className="ab-car" />
      <div className="ab-grass" />
    </div>
  );
}
