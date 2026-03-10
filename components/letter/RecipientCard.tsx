import { MapPin, Mail, Globe, Building2 } from 'lucide-react'

interface Recipient {
  company_name: string
  category?: string | null
  postal_address?: string | null
  email?: string | null
  website?: string | null
}

interface Props {
  recipient: Recipient
}

export function RecipientCard({ recipient }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
        <Building2 className="h-4 w-4 text-gray-500" />
        Destinataire suggéré
      </h2>

      <div className="space-y-2.5">
        <div>
          <p className="font-semibold text-gray-900">{recipient.company_name}</p>
          {recipient.category && (
            <p className="text-xs capitalize text-gray-400">{recipient.category}</p>
          )}
        </div>

        {recipient.postal_address && (
          <div className="flex gap-2 text-sm text-gray-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <p className="leading-relaxed">{recipient.postal_address}</p>
          </div>
        )}

        {recipient.email && (
          <div className="flex gap-2 text-sm text-gray-600">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <a href={`mailto:${recipient.email}`} className="hover:underline">
              {recipient.email}
            </a>
          </div>
        )}

        {recipient.website && (
          <div className="flex gap-2 text-sm text-gray-600">
            <Globe className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <a
              href={`https://${recipient.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {recipient.website}
            </a>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-400">
        ℹ️ Vérifiez l'adresse sur le site officiel avant d'envoyer
      </p>
    </div>
  )
}
