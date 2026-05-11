import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";

const steps = [
	{
		title: "Objavi oglas",
		description:
			"Kreiraj lost ili found prijavu sa jasnim detaljima i lokacijom.",
	},
	{
		title: "Match prijedlozi",
		description: "Sistem prepoznaje moguće podudarnosti i šalje ti obavijesti.",
	},
	{
		title: "Verifikacija vlasništva",
		description:
			"Sigurnosni koraci potvrđuju identitet prije razmjene kontakata.",
	},
	{
		title: "Povrat predmeta",
		description: "Predmet se vraća, a oglas se zatvara kao resolved.",
	},
];

export function HowItWorks() {
	return (
		<section id="kako-funkcionise" className="how-it-works">
			<Container className="how-it-works__inner">
				<SectionHeading
					title="Kako funkcioniše"
					description="Jasan i siguran proces od prijave do povrata predmeta."
				/>
				<div className="how-it-works__grid">
					{steps.map((step, index) => (
						<div key={step.title} className="how-it-works__card">
							<span className="how-it-works__step">{index + 1}</span>
							<h3 className="how-it-works__title">{step.title}</h3>
							<p className="how-it-works__description">
								{step.description}
							</p>
						</div>
					))}
				</div>
			</Container>
		</section>
	);
}
