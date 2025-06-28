// src/fontawesome.js
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHeadset } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope as faEnvelopeRegular } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

library.add(
  faHeadset,
  faEnvelopeRegular,
  fab
  // İhtiyacınız olan diğer ikonlar buraya eklenebilir
);
