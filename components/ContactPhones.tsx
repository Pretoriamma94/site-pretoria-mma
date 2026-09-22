const contacts = [
  { name: 'Romain', number: '06 19 84 57 86', href: 'tel:+33619845786' },
  { name: 'Patino', number: '06 51 78 76 62', href: 'tel:+33651787662' },
  { name: 'Anthony', number: '07 64 85 02 52', href: 'tel:+33764850252' },
  { name: 'Pierre', number: '07 64 05 43 24', href: 'tel:+33764054324' },
  { name: 'Patate', number: '06 13 65 00 84', href: 'tel:+33613650084' },
];

export function ContactPhones() {
  return (
    <ul className="mt-2 space-y-1" aria-label="Contacts téléphoniques du club">
      {contacts.map(contact => (
        <li key={contact.name}>
          <a href={contact.href} className="inline-flex min-h-11 flex-wrap items-center gap-x-2 rounded text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mma-red">
            <span className="font-semibold">{contact.name} :</span>
            <span className="whitespace-nowrap">{contact.number}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
