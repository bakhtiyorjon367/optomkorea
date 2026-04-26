import { useContext } from 'react';
import { LangContext } from '../context/lang-context';

export function useLang() {
  return useContext(LangContext);
}
