import { defineFormKitConfig } from '@formkit/vue'
import '@formkit/themes/genesis'
import { genesisIcons } from '@formkit/icons'

export default defineFormKitConfig({
	icons: {
		...genesisIcons
	}
})
